import { CurrencyEurIcon, UsersThreeIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useFilterLayout } from '../internal/filter-layout.ts'
import { FilterNumberInput } from '../internal/filter-number-input.tsx'
import { FilterRow } from '../internal/filter-row.tsx'
import { formatNumber, typedNumber } from '../internal/numbers.ts'
import type { NumberUnit } from '../internal/numbers.ts'
import { RangeSlider } from './range-slider.tsx'

type FilterNumberRangeProps = {
  /** Prefix of the two fields' ids. */
  id: string
  legend: string
  /** Money in a currency (« EUR »), or a count (guests). */
  unit: NumberUnit
  /** The track's right end and its step. */
  scale: { max: number; step: number }
  min: number | undefined
  max: number | undefined
  onChange: (range: { min?: number; max?: number }) => void
  /** Its icon, the euro or people by default. */
  icon?: Icon
}

/**
 * Two numbers of a `FilterMenu`, both included: « À partir de » and
 * « Jusqu'à », money or a count. Either can stay empty. Set by dragging
 * two thumbs on a track, or typed in the fields under it.
 *
 * @summary A filter on an amount or a count, from and to.
 */
function FilterNumberRange({
  id,
  legend,
  unit,
  scale,
  min,
  max,
  onChange,
  icon,
}: FilterNumberRangeProps) {
  const messages = useGoGoUIMessages()
  const layout = useFilterLayout()
  const groupIcon =
    icon ?? (unit.kind === 'money' ? CurrencyEurIcon : UsersThreeIcon)
  const format = (value: number) =>
    formatNumber(value, messages.intlLocale, unit)

  if (layout.mode === 'row') {
    return (
      <FilterRow
        label={legend}
        summary={messages.numberRange(
          min === undefined ? undefined : format(min),
          max === undefined ? undefined : format(max),
        )}
        onOpen={layout.open}
        icon={groupIcon}
      />
    )
  }

  const bound = {
    icon: groupIcon,
    decimals: unit.kind === 'money',
    show: (value: number) => typedNumber(value, messages.intlLocale),
    example:
      unit.kind === 'money' ? messages.amountExample : messages.countExample,
  }
  return (
    <fieldset className="@container">
      <legend className="pb-2 font-medium">{legend}</legend>
      <RangeSlider
        label={legend}
        max={scale.max}
        step={scale.step}
        low={min}
        high={max}
        format={format}
        onCommit={onChange}
        className="mb-3"
      />
      <div className="grid gap-3 @sm:grid-cols-2">
        <FilterNumberInput
          {...bound}
          id={`${id}-min`}
          label={messages.fromNumber}
          value={min}
          onChange={(value) => onChange({ min: value, max })}
        />
        <FilterNumberInput
          {...bound}
          id={`${id}-max`}
          label={messages.upToNumber}
          value={max}
          onChange={(value) => onChange({ min, max: value })}
        />
      </div>
    </fieldset>
  )
}

export { FilterNumberRange }
export type { FilterNumberRangeProps, NumberUnit }
