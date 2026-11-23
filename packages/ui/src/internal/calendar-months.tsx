import type { MonthsProps } from 'react-day-picker'

import {
  CalendarSelectionContext,
  useCalendarSelectionState,
} from './calendar-state.ts'

/**
 * Calendar's months, holding what its days and layers share: the
 * selection, the day under the pointer, the colour handoff.
 *
 * @summary Internal: Calendar's `Months`, the selection's home.
 */
export function CalendarMonths(props: MonthsProps) {
  const selection = useCalendarSelectionState()
  return (
    <CalendarSelectionContext value={selection}>
      <div {...props} />
    </CalendarSelectionContext>
  )
}
