import { useState } from 'react'
import { CalendarDotsIcon } from '@phosphor-icons/react'
import type { DateRange, Matcher } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { Color } from '../internal/colors.ts'
import { formatTypedDay, parseDay, toDay } from '../internal/days.ts'
import { useIsMobile } from '../internal/use-is-mobile.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { Calendar } from './calendar.tsx'
import { Popover, PopoverContent, PopoverTrigger } from './popover.tsx'

/** A ready-made period: « 7 derniers jours ». */
type DateRangePreset = { label: string; from: string; to: string }

type DateRangePickerProps = {
  id?: string
  /** "YYYY-MM-DD", or absent. */
  from: string | undefined
  to: string | undefined
  onChange: (range: { from?: string; to?: string }) => void
  placeholder?: string
  /** Shortcuts beside the months (`useDateRangePresets()` gives the usual ones). */
  presets?: readonly DateRangePreset[]
  /** Days that cannot be chosen; a period cannot cross them. */
  disabledDates?: Matcher | Matcher[]
  /** The shortest and longest period, in days (a stay of 2 to 14 nights). */
  minDays?: number
  maxDays?: number
  /** The chosen days' colour; the primary by default. */
  color?: Color
  className?: string
}

/**
 * The usual period shortcuts, counted from today: today, the last 7 and 30
 * days, this month, last month, the next 30 days.
 *
 * **Use it for** `<DateRangePicker presets={useDateRangePresets()} />`.
 *
 * @summary The usual period shortcuts, from today.
 */
function useDateRangePresets(): DateRangePreset[] {
  const messages = useGoGoUIMessages()
  // Read once: the shortcuts do not move while the page is open.
  const [today] = useState(() => new Date())
  const day = (offset: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return toDay(date)
  }
  const year = today.getFullYear()
  const month = today.getMonth()
  return [
    { label: messages.presetToday, from: day(0), to: day(0) },
    { label: messages.presetLast7Days, from: day(-6), to: day(0) },
    { label: messages.presetLast30Days, from: day(-29), to: day(0) },
    {
      label: messages.presetThisMonth,
      from: toDay(new Date(year, month, 1)),
      to: toDay(new Date(year, month + 1, 0)),
    },
    {
      label: messages.presetLastMonth,
      from: toDay(new Date(year, month - 1, 1)),
      to: toDay(new Date(year, month, 0)),
    },
    { label: messages.presetNext30Days, from: day(0), to: day(29) },
  ]
}

/**
 * A period picked in a two-month calendar, with shortcuts.
 *
 * **Use it for** a report's period, a stay, a filter on dates. **Prefer**
 * `DateField` for one day.
 *
 * **States**: empty, start chosen, full range, disabled days, too short or
 * too long.
 *
 * **Key props**: `from`, `to`, `onChange`, `placeholder`, `presets`
 * (`useDateRangePresets()` gives the usual ones: 7 days, this month…),
 * `minDays`, `maxDays`, `disabledDates`, `color`.
 *
 * **Accessibility**: the button says the chosen period in words.
 *
 * @summary A period picked in a two-month calendar.
 */
function DateRangePicker({
  id,
  from,
  to,
  onChange,
  placeholder,
  presets,
  disabledDates,
  minDays,
  maxDays,
  color,
  className,
}: DateRangePickerProps) {
  const messages = useGoGoUIMessages()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const selected: DateRange | undefined =
    from || to ? { from: parseDay(from), to: parseDay(to) } : undefined
  const typed = (day: string | undefined) =>
    day ? formatTypedDay(day, messages.dayOrder) : undefined
  const label = messages.dateRange(typed(from), typed(to))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        render={
          <Button
            variant="outline"
            className={cn('w-full justify-start font-normal', className)}
          />
        }
      >
        <CalendarDotsIcon aria-hidden="true" />
        <span
          className={cn(
            'truncate first-letter:uppercase',
            !label && 'text-fg-subtle',
          )}
        >
          {label ?? placeholder ?? messages.pickDates}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col md:flex-row">
          {presets && presets.length > 0 && (
            <div
              role="group"
              aria-label={messages.presets}
              className="flex flex-wrap gap-1 border-b border-line p-2 md:w-44 md:flex-col md:flex-nowrap md:border-e md:border-b-0"
            >
              {presets.map((preset) => {
                const chosen = preset.from === from && preset.to === to
                return (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    aria-pressed={chosen}
                    className="justify-start aria-pressed:bg-selected aria-pressed:text-fg"
                    onClick={() =>
                      onChange({ from: preset.from, to: preset.to })
                    }
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          )}
          <Calendar
            mode="range"
            numberOfMonths={isMobile ? 1 : 2}
            selected={selected}
            // A new month when a shortcut is picked.
            key={presets ? from : undefined}
            defaultMonth={selected?.from ?? selected?.to}
            onSelect={(range: DateRange | undefined) =>
              onChange({
                from: range?.from ? toDay(range.from) : undefined,
                to: range?.to ? toDay(range.to) : undefined,
              })
            }
            disabled={disabledDates}
            excludeDisabled={disabledDates !== undefined}
            min={minDays}
            max={maxDays}
            color={color}
            locale={messages.intlLocale.startsWith('fr') ? fr : undefined}
            // Days of 44 px, a thumb's target.
            className="[--cell-size:--spacing(11)]"
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-line p-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={!from && !to}
            onClick={() => onChange({})}
          >
            {messages.clearDates}
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            {messages.confirm}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker, useDateRangePresets }
export type { DateRangePickerProps, DateRangePreset }
