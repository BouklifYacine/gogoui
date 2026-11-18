import { useState } from 'react'
import { CalendarDotsIcon } from '@phosphor-icons/react'
import type { DateRange } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { formatTypedDay, parseDay, toDay } from '../internal/days.ts'
import { useIsMobile } from '../internal/use-is-mobile.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { Calendar } from './calendar.tsx'
import { Popover, PopoverContent, PopoverTrigger } from './popover.tsx'

type DateRangePickerProps = {
  id?: string
  /** "YYYY-MM-DD", or absent. */
  from: string | undefined
  to: string | undefined
  onChange: (range: { from?: string; to?: string }) => void
  placeholder?: string
  className?: string
}

/**
 * A period, day to day, both included: one button that opens two months
 * side by side (one on a phone), a first click on the first day, a second
 * on the last. The button then says it: « du 01/11/2026 au 26/02/2027 ».
 * A first day alone means « from that day ».
 *
 * @summary A period picked in a two-month calendar.
 */
function DateRangePicker({
  id,
  from,
  to,
  onChange,
  placeholder,
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
        <Calendar
          mode="range"
          numberOfMonths={isMobile ? 1 : 2}
          selected={selected}
          defaultMonth={selected?.from ?? selected?.to}
          onSelect={(range: DateRange | undefined) =>
            onChange({
              from: range?.from ? toDay(range.from) : undefined,
              to: range?.to ? toDay(range.to) : undefined,
            })
          }
          locale={messages.intlLocale.startsWith('fr') ? fr : undefined}
          // Days of 44 px, a thumb's target.
          className="[--cell-size:--spacing(11)]"
        />
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

export { DateRangePicker }
export type { DateRangePickerProps }
