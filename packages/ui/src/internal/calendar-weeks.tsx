import { useContext } from 'react'
import type { WeeksProps } from 'react-day-picker'

import { CalendarLayer } from './calendar-layer.tsx'
import {
  CalendarMonthContext,
  CalendarSelectionContext,
} from './calendar-state.ts'
import { toDay } from './days.ts'

/**
 * A month's weeks, with the highlight layer laid over them. The layer is
 * keyed by month: a new month gets its own, it never glides in from the
 * previous one.
 *
 * @summary Internal: Calendar's `Weeks`, with the highlight layer.
 */
export function CalendarWeeks({ children, ...props }: WeeksProps) {
  const month = useContext(CalendarMonthContext)
  const selection = useContext(CalendarSelectionContext)
  return (
    <tbody
      {...props}
      // Leaving the days drops the range that followed the pointer.
      onPointerLeave={
        selection?.rangeMode ? () => selection.setHovered(undefined) : undefined
      }
    >
      {children}
      {month && <CalendarLayer key={toDay(month.date)} month={month} />}
    </tbody>
  )
}
