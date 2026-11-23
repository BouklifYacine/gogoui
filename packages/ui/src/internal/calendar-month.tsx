import type { MonthProps } from 'react-day-picker'

import { CalendarMonthContext } from './calendar-state.ts'

/**
 * One month of Calendar: react-day-picker's own, telling its weeks which
 * month they draw.
 *
 * @summary Internal: Calendar's `Month`.
 */
export function CalendarMonth({
  calendarMonth,
  displayIndex: _displayIndex,
  ...props
}: MonthProps) {
  return (
    <CalendarMonthContext value={calendarMonth}>
      <div {...props} />
    </CalendarMonthContext>
  )
}
