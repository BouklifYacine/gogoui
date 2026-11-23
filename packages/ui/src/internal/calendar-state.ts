// What Calendar's parts share, after Arc UI's calendar (https://uiarc.dev,
// MIT): the selection disc, the range bars and the colour handoff of a
// day's number. The state lives inside react-day-picker's tree (its
// `Months`), so it reads the true selection, controlled or not.

import { createContext, useState } from 'react'
import {
  addToRange,
  isDateRange,
  rangeContainsModifiers,
  useDayPicker,
} from 'react-day-picker'
import type { CalendarMonth, DateRange } from 'react-day-picker'

import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from './colors.ts'
import { toDay } from './days.ts'

/** What Calendar sets once for all its parts. */
export type CalendarLook = {
  color: Color
  /** A « Today » button beside the arrows. */
  showToday: boolean
}

export const CalendarLookContext = createContext<CalendarLook>({
  color: 'primary',
  showToday: false,
})

/** The month a grid draws, for the layer under its days. */
export const CalendarMonthContext = createContext<CalendarMonth | null>(null)

export type CalendarSelection = {
  /** The chosen day, in single mode. */
  single: Date | undefined
  /** The range to draw, in range mode: the chosen one, or where a click would take it. */
  range: DateRange | undefined
  rangeMode: boolean
  /** The last move came from the keyboard: highlights land without gliding. */
  keyed: boolean
  setKeyed: (keyed: boolean) => void
  setHovered: (date: Date | undefined) => void
  /** How long a day's number waits before it changes colour, in ms. */
  numberDelay: (day: string) => number | undefined
}

export const CalendarSelectionContext = createContext<CalendarSelection | null>(
  null,
)

const dayIndex = (date: Date) =>
  Math.round(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5,
  )

export function sameDay(a: Date | undefined, b: Date | undefined): boolean {
  return Boolean(a && b && dayIndex(a) === dayIndex(b))
}

/** True when `date` falls between `from` and `to`, both included. */
export function within(date: Date, from: Date, to: Date): boolean {
  const at = dayIndex(date)
  return at >= dayIndex(from) && at <= dayIndex(to)
}

export type Cell = { row: number; col: number }

/** Where a day sits on a month's grid, or null when the grid does not show it. */
export function cellOf(
  month: CalendarMonth,
  date: Date | undefined,
  outsideToo: boolean,
): Cell | null {
  if (!date) {
    return null
  }
  for (const [row, week] of month.weeks.entries()) {
    const col = week.days.findIndex((day) => sameDay(day.date, date))
    if (col >= 0) {
      return week.days[col]?.outside && !outsideToo ? null : { row, col }
    }
  }
  return null
}

/** One week's slice of a range, in percent of the row. */
export type Segment = { left: number; width: number } | null

/**
 * Each week's slice of the range. A week wholly before or after it keeps a
 * slice of no width at the edge the range would grow in from, so a range
 * that reaches it seems to stretch.
 */
export function rangeSegments(
  month: CalendarMonth,
  range: DateRange | undefined,
): Segment[] {
  const from = range?.from
  const to = range?.to ?? range?.from
  if (!from || !to) {
    return month.weeks.map(() => null)
  }
  const low = Math.min(dayIndex(from), dayIndex(to))
  const high = Math.max(dayIndex(from), dayIndex(to))
  const unit = 100 / 7
  return month.weeks.map((week) => {
    const inside = week.days.flatMap((day, col) =>
      day.outside ? [] : [{ at: dayIndex(day.date), col }],
    )
    const first = inside[0]
    const last = inside.at(-1)
    if (!first || !last) {
      return null
    }
    const start = Math.max(low, first.at)
    const end = Math.min(high, last.at)
    if (start <= end) {
      const a = inside.find((day) => day.at === start)?.col ?? first.col
      const b = inside.find((day) => day.at === end)?.col ?? last.col
      return { left: a * unit, width: (b - a + 1) * unit }
    }
    if (last.at < low) {
      return { left: (last.col + 1) * unit, width: 0 }
    }
    return { left: first.col * unit, width: 0 }
  })
}

/**
 * The selection as Calendar's parts draw it. In range mode, once the first
 * day is picked, the range follows the pointer: it shows where the next
 * click takes it, by react-day-picker's own rule (min, max, booked days).
 */
export function useCalendarSelectionState(): CalendarSelection {
  const { selected: chosen, dayPickerProps: props } = useDayPicker()
  // react-day-picker types the selection by mode; read it as what it is.
  const selected: unknown = chosen
  const reduce = useReduceMotion()
  const [hovered, setHovered] = useState<Date | undefined>(undefined)
  const [keyed, setKeyed] = useState(false)

  const single =
    props.mode === 'single' && selected instanceof Date ? selected : undefined

  // The disc glides between days, so each number flips colour as the disc
  // really passes it: the day it leaves waits less on short hops, the day
  // it lands on waits more on long ones.
  const key = single ? toDay(single) : ''
  const [last, setLast] = useState({ key, date: single })
  const [handoff, setHandoff] = useState({ from: '', to: '', distance: 0 })
  if (last.key !== key) {
    let distance = 0
    if (last.date && single) {
      const weekStart =
        props.weekStartsOn ?? props.locale?.options?.weekStartsOn ?? 0
      const column = (date: Date) => (date.getDay() - weekStart + 7) % 7
      const days = dayIndex(single) - dayIndex(last.date)
      const columns = column(single) - column(last.date)
      distance = Math.hypot(columns, (days - columns) / 7)
    }
    setLast({ key, date: single })
    setHandoff({ from: last.key, to: key, distance })
  }

  let range: DateRange | undefined
  if (props.mode === 'range' && isDateRange(selected)) {
    range = selected
    const from = selected.from
    const anchored = from && (!selected.to || sameDay(from, selected.to))
    if (anchored && hovered && !keyed && !sameDay(hovered, from)) {
      const next = addToRange(
        hovered,
        selected,
        props.min,
        props.max,
        props.required,
      )
      const crosses = Boolean(
        props.excludeDisabled &&
        props.disabled &&
        next?.from &&
        next.to &&
        rangeContainsModifiers(
          { from: next.from, to: next.to },
          props.disabled,
        ),
      )
      if (next && !crosses) {
        range = next
      }
    }
  }

  return {
    single,
    range,
    rangeMode: props.mode === 'range',
    keyed,
    setKeyed,
    setHovered,
    numberDelay: (day) => {
      if (reduce || keyed || !handoff.distance) {
        return undefined
      }
      if (day === handoff.to) {
        return Math.round(
          Math.min(260, 95 + 85 * Math.log(Math.max(1, handoff.distance))),
        )
      }
      if (day === handoff.from) {
        return Math.round(Math.max(20, 130 / handoff.distance))
      }
      return undefined
    },
  }
}
