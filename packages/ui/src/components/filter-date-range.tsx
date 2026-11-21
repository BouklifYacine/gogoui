import { CalendarDotsIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { formatTypedDay, parseDay } from '../internal/days.ts'
import { useFilterLayout } from '../internal/filter-layout.ts'
import { FilterRow } from '../internal/filter-row.tsx'
import { DateField } from './date-field.tsx'
import { DateRangePicker } from './date-range-picker.tsx'

type FilterDateRangeProps = {
  /** Prefix of the fields' ids. */
  id: string
  legend: string
  /** "YYYY-MM-DD", or absent. */
  from: string | undefined
  to: string | undefined
  onChange: (range: { from?: string; to?: string }) => void
}

/**
 * A filter on a period (« Date de l'événement »).
 *
 * **Key props**: `legend`, `from`, `to`, `onChange`.
 *
 * @summary A filter on a period.
 */
function FilterDateRange({
  id,
  legend,
  from,
  to,
  onChange,
}: FilterDateRangeProps) {
  const messages = useGoGoUIMessages()
  const layout = useFilterLayout()
  if (layout.mode === 'row') {
    const typed = (day: string | undefined) =>
      day ? formatTypedDay(day, messages.dayOrder) : undefined
    return (
      <FilterRow
        label={legend}
        summary={messages.dateRange(typed(from), typed(to))}
        onOpen={layout.open}
        icon={CalendarDotsIcon}
      />
    )
  }

  const fromDay = parseDay(from)
  const toDay = parseDay(to)
  return (
    <fieldset className="@container flex flex-col gap-3">
      <legend className="pb-2 font-medium">{legend}</legend>
      {/* Side by side when there is room, one under the other on a phone. */}
      <div className="grid gap-3 @sm:grid-cols-2">
        <DateField
          id={`${id}-from`}
          label={messages.fromDay}
          value={from ?? null}
          onValueChange={(day) => onChange({ from: day ?? undefined, to })}
          disabledDates={toDay ? { after: toDay } : undefined}
        />
        <DateField
          id={`${id}-to`}
          label={messages.untilDay}
          value={to ?? null}
          onValueChange={(day) => onChange({ from, to: day ?? undefined })}
          disabledDates={fromDay ? { before: fromDay } : undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-fg-muted">{messages.wholePeriod}</span>
        <DateRangePicker
          id={`${id}-range`}
          from={from}
          to={to}
          onChange={onChange}
        />
      </div>
    </fieldset>
  )
}

export { FilterDateRange }
export type { FilterDateRangeProps }
