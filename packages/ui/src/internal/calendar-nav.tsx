import { useContext, useSyncExternalStore } from 'react'
import type { MouseEvent } from 'react'
import { Nav, dateMatchModifiers, useDayPicker } from 'react-day-picker'
import type { Modifiers, NavProps } from 'react-day-picker'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { CalendarLookContext, sameDay } from './calendar-state.ts'

/**
 * Calendar's arrows, and with `showToday` a « Today » button before them,
 * after Arc UI (https://uiarc.dev, MIT): it slides back to today's month
 * and, in single mode, chooses today when it can be chosen.
 *
 * The arrows are not a landmark: react-day-picker draws them in a `nav`
 * with an empty name, and two calendars on a page would give two landmarks
 * no one can tell apart. `role="none"` keeps a plain box; each arrow is
 * named on its own.
 *
 * @summary Internal: Calendar's `Nav`, with its « Today » button.
 */

// Today, read in the browser only. The server and the browser may not share
// a day (around midnight, another time zone), so the server draws no
// « Aujourd'hui » button and the browser adds it once hydrated. The day is
// kept as a string so React sees the same value between two reads.
const neverChanges = () => () => {}
const todayKey = () => new Date().toDateString()

function useToday(): Date | undefined {
  const key = useSyncExternalStore(neverChanges, todayKey, () => null)
  return key ? new Date(key) : undefined
}

export function CalendarNav({
  className,
  // The empty name would undo `role="none"`.
  'aria-label': _emptyName,
  ...props
}: NavProps) {
  const { showToday } = useContext(CalendarLookContext)
  const picker = useDayPicker()
  const { months, goToMonth, dayPickerProps } = picker
  // react-day-picker types these by mode; in single mode they take a day.
  const selected: unknown = picker.selected
  const select = picker.select as
    ((date: Date, modifiers: Modifiers, event: MouseEvent) => void) | undefined
  const messages = useGoGoUIMessages()
  const now = useToday()
  const today = dayPickerProps.today ?? now
  if (!showToday || !today) {
    return <Nav role="none" className={className} {...props} />
  }
  const choosable =
    dayPickerProps.mode === 'single' &&
    !(dayPickerProps.disabled
      ? dateMatchModifiers(today, dayPickerProps.disabled)
      : false)
  const shown = months.some(
    (month) =>
      month.date.getFullYear() === today.getFullYear() &&
      month.date.getMonth() === today.getMonth(),
  )
  // Nothing left to do: today's month is on screen and today is chosen
  // (or cannot be).
  const idle =
    shown &&
    (!choosable || (selected instanceof Date && sameDay(selected, today)))
  const spoken = new Intl.DateTimeFormat(messages.intlLocale, {
    dateStyle: 'full',
  }).format(today)

  return (
    <div className={className}>
      <button
        type="button"
        aria-disabled={idle || undefined}
        aria-label={messages.todayLabel(spoken)}
        className="h-8 rounded-full px-3 text-sm font-medium text-fg-muted transition-[background-color,color,scale] duration-(--motion-fast) ease-standard select-none hover:not-aria-disabled:bg-hover hover:not-aria-disabled:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:not-aria-disabled:scale-96 aria-disabled:cursor-default aria-disabled:opacity-35 motion-reduce:transition-none"
        onClick={(event) => {
          if (idle) {
            return
          }
          if (!shown) {
            goToMonth(today)
          }
          if (
            choosable &&
            !(selected instanceof Date && sameDay(selected, today))
          ) {
            select?.(today, {}, event)
          }
        }}
      >
        {messages.today}
      </button>
      <Nav role="none" className="flex items-center gap-0.5" {...props} />
    </div>
  )
}
