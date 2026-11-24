import { Children, useCallback, useContext } from 'react'
import type { ComponentProps } from 'react'
import { useDayPicker } from 'react-day-picker'
import type { DayButton, Locale } from 'react-day-picker'

import {
  CalendarLookContext,
  CalendarSelectionContext,
  sameDay,
  within,
} from '../internal/calendar-state.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

// The number on a filled disc.
const onFill: Record<Color, string> = {
  neutral: 'text-neutral-foreground',
  primary: 'text-primary-foreground',
  info: 'text-info-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  danger: 'text-danger-foreground',
}

// The number on a range's tint.
const onTint: Record<Color, string> = {
  neutral: 'text-neutral-fg',
  primary: 'text-primary-active',
  info: 'text-info-fg',
  success: 'text-success-fg',
  warning: 'text-warning-fg',
  danger: 'text-danger-fg',
}

// Several chosen days (multiple mode): each day fills its own circle.
const pickedFill: Record<Color, string> = {
  neutral: 'before:bg-neutral hover:before:bg-neutral',
  primary: 'before:bg-primary hover:before:bg-primary-hover',
  info: 'before:bg-info hover:before:bg-info',
  success: 'before:bg-success hover:before:bg-success',
  warning: 'before:bg-warning hover:before:bg-warning',
  danger: 'before:bg-danger hover:before:bg-danger',
}

const KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter',
  ' ',
])

/**
 * One day of `Calendar`, after Arc UI (https://uiarc.dev, MIT): a round
 * day whose number changes colour as the chosen day's disc reaches it, a
 * small dot under today, a soft fill when pointed at and a short press.
 *
 * **Use it for** `components.DayButton` of a Calendar, to add something
 * under the number (a price, dots per resource) and keep the look:
 * `DayButton: (props) => <CalendarDayButton {...props}>{props.children}<span>4,5k</span></CalendarDayButton>`.
 * **Not for** a day outside a Calendar.
 *
 * **States**: rest, pointed at, pressed, focused, today, outside the
 * month, disabled, chosen (on the disc), in a range, an end of a range.
 *
 * **Key props**: what react-day-picker gives (`day`, `modifiers`…), plus
 * `dayColor` (the calendar's `color` by default).
 *
 * **Accessibility**: a day is named by what it shows, so its name always
 * holds the number seen on screen (WCAG 2.5.3): the number, then hidden
 * words « juin 2027, lundi » (and « aujourd’hui », « sélectionné »), then
 * whatever was added under the number. The disc and the dot are drawn,
 * never read.
 *
 * @summary One day of Calendar, round, with Arc UI's motion.
 */
function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  // The HTML colour attribute is not a day's colour.
  color: _htmlColor,
  dayColor,
  style,
  onKeyDown,
  onPointerDown,
  onPointerEnter,
  ...props
}: ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>
  /** The chosen day's colour; the calendar's `color` by default. */
  dayColor?: Color
}) {
  const look = useContext(CalendarLookContext)
  const selection = useContext(CalendarSelectionContext)
  const { dayPickerProps } = useDayPicker()
  const color = dayColor ?? look.color
  const date = day.date

  // react-day-picker's number comes first; what a composition adds under
  // it (a price, dots) follows.
  const [number, ...added] = Children.toArray(children)
  const rest = messages.calendarDayRest({
    monthYear: date.toLocaleDateString(messages.intlLocale, {
      month: 'long',
      year: 'numeric',
    }),
    weekday: date.toLocaleDateString(messages.intlLocale, { weekday: 'long' }),
    today: Boolean(modifiers.today),
    selected: Boolean(modifiers.selected),
  })

  // react-day-picker moves the focus by telling a day it is focused.
  const focused = Boolean(modifiers.focused)
  const focusWhenTold = useCallback(
    (node: HTMLButtonElement | null) => {
      if (node && focused) {
        node.focus()
      }
    },
    [focused],
  )

  const range = selection?.range
  const rangeEnd = range?.to ?? range?.from
  const edge =
    !day.outside &&
    (sameDay(date, range?.from) ||
      (Boolean(range?.to) && sameDay(date, range?.to)))
  const middle =
    !day.outside &&
    !edge &&
    Boolean(range?.from && rangeEnd && within(date, range.from, rangeEnd))
  const single = sameDay(date, selection?.single)
  const onDisc = single || edge
  // Several days (or a day outside Calendar's own months): the day fills.
  const picked =
    Boolean(modifiers.selected) && !selection?.single && !selection?.range
  const delay = selection?.numberDelay(day.isoDate) ?? (edge ? 40 : undefined)

  return (
    <button
      ref={focusWhenTold}
      data-day={date.toLocaleDateString(
        (locale ?? dayPickerProps.locale)?.code,
      )}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-on-disc={onDisc || undefined}
      data-today={modifiers.today || undefined}
      // Outside the month, the number is quieter, unless a disc is under it.
      data-outside={(day.outside && !onDisc && !picked) || undefined}
      style={{
        ...style,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
      className={cn(
        'relative isolate z-10 flex aspect-square w-full min-w-(--cell-size) flex-col items-center justify-center gap-0.5 rounded-full border-0 p-0 text-sm leading-none font-normal text-fg tabular-nums outline-none select-none',
        // Only the colour moves, with the delay the disc asks for.
        'transition-[color] duration-(--motion-fast) ease-standard motion-reduce:transition-none',
        // The fill and the press live on an inner circle: the cell itself
        // never moves, so what is under the finger stays put.
        'before:absolute before:inset-0.5 before:-z-10 before:rounded-full before:transition-[background-color,scale] before:duration-(--motion-fast) before:ease-standard motion-reduce:before:transition-none',
        'hover:not-disabled:before:bg-hover active:not-disabled:before:scale-94',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus',
        'data-outside:text-fg-subtle disabled:cursor-default disabled:text-fg-disabled',
        // Today: a small dot under the number, in its colour, so it turns
        // with it when the disc arrives.
        'data-today:font-medium data-today:after:absolute data-today:after:bottom-[calc(50%-15px)] data-today:after:left-1/2 data-today:after:size-1 data-today:after:-translate-x-1/2 data-today:after:rounded-full data-today:after:bg-current',
        // What is added under the number is quieter, but not outside the
        // month, whose grey would then fall under 4.5:1.
        '[&>span]:text-xs [&>span]:opacity-70 data-outside:[&>span]:opacity-100',
        onDisc && cn('font-medium before:hidden', onFill[color]),
        middle && onTint[color],
        picked && cn('font-medium', onFill[color], pickedFill[color]),
        className,
      )}
      onKeyDown={(event) => {
        if (KEYS.has(event.key) && selection && !selection.keyed) {
          selection.setKeyed(true)
        }
        onKeyDown?.(event)
      }}
      onPointerDown={(event) => {
        if (selection?.keyed) {
          selection.setKeyed(false)
        }
        onPointerDown?.(event)
      }}
      onPointerEnter={(event) => {
        if (selection?.rangeMode && !modifiers.disabled) {
          if (selection.keyed) {
            selection.setKeyed(false)
          }
          selection.setHovered(date)
        }
        onPointerEnter?.(event)
      }}
      {...props}
    >
      {number}
      <span className="sr-only">{rest}</span>
      {added}
    </button>
  )
}

export { CalendarDayButton }
