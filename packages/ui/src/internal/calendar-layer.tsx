import { useContext } from 'react'
import { AnimatePresence } from 'motion/react'
import { useDayPicker } from 'react-day-picker'
import type { CalendarMonth } from 'react-day-picker'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { CalendarDisc } from './calendar-disc.tsx'
import { CalendarRangeBar } from './calendar-range-bar.tsx'
import {
  CalendarLookContext,
  CalendarSelectionContext,
  cellOf,
  rangeSegments,
  sameDay,
} from './calendar-state.ts'

/**
 * What lies under a month's days, after Arc UI (https://uiarc.dev, MIT):
 * the chosen day's disc, or a range's bars and its two ends. One row of
 * the grid, hidden from screen readers (they read `aria-selected` on the
 * days), laid over the weeks.
 *
 * @summary Internal: the highlight layer of one Calendar month.
 */
export function CalendarLayer({ month }: { month: CalendarMonth }) {
  const { dayPickerProps } = useDayPicker()
  const { color } = useContext(CalendarLookContext)
  const selection = useContext(CalendarSelectionContext)
  const reduce = useReduceMotion()
  if (!selection) {
    return null
  }
  const { single, range, rangeMode } = selection
  // From the keyboard, or with reduced motion, everything lands at once.
  const keyed = selection.keyed || reduce
  const outsideToo = dayPickerProps.showOutsideDays === true

  const disc = single ? cellOf(month, single, outsideToo) : null
  const segments = rangeMode ? rangeSegments(month, range) : []
  const start = rangeMode ? cellOf(month, range?.from, false) : null
  const end =
    rangeMode && range?.to && !sameDay(range.from, range.to)
      ? cellOf(month, range.to, false)
      : null

  return (
    <tr aria-hidden="true" className="contents">
      <td
        className="pointer-events-none absolute inset-y-0 right-0 z-0 p-0 [container-type:inline-size]"
        // Week numbers take the first column.
        style={{
          left: dayPickerProps.showWeekNumber ? 'var(--cell-size)' : 0,
        }}
      >
        <AnimatePresence initial={false}>
          {segments.map(
            (segment, row) =>
              segment && (
                <CalendarRangeBar
                  key={`bar-${row}`}
                  row={row}
                  left={segment.left}
                  width={segment.width}
                  color={color}
                  instant={keyed}
                />
              ),
          )}
          {start && (
            <CalendarDisc
              key="start"
              cell={start}
              color={color}
              instant={keyed}
              ends
            />
          )}
          {end && (
            <CalendarDisc
              key="end"
              cell={end}
              color={color}
              instant={keyed}
              ends
            />
          )}
          {disc && (
            <CalendarDisc
              key="disc"
              cell={disc}
              color={color}
              instant={keyed}
            />
          )}
        </AnimatePresence>
      </td>
    </tr>
  )
}
