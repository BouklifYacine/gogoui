import type { Icon } from '@phosphor-icons/react'

import { useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { cn } from '../lib/cn.ts'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from './field.tsx'
import { RadioGroup, RadioGroupItem } from './radio-group.tsx'

type RadioCardFieldProps<TValue extends string> = Omit<
  FieldValueProps<TValue | ''>,
  'description'
> & {
  legend: string
  /** An icon gives the card a tinted tile before its label. */
  options: readonly { value: TValue; label: string; icon?: Icon }[]
  /** Said to screen readers; the look stays the same. */
  required?: boolean
  /** For screen readers only, when the page title already asks it. */
  hideLegend?: boolean
  /** Two or three one-word choices side by side, on a phone too. */
  inline?: boolean
  /** Many one-line choices as one framed list, the radio on the right. */
  list?: boolean
}

/**
 * One choice among cards seen at once.
 *
 * **Use it for** 2 to 5 options where an icon helps: a type of event, a
 * plan, a payment mode.
 *
 * **Key props**: `legend`, `options` (`{ value, label, icon? }[]`), `value`
 * + `onValueChange`, `error`, `required`, `hideLegend`, `inline` (in a
 * row), `list` (stacked lines).
 *
 * **Accessibility**: a fieldset with its legend; arrows move the choice.
 *
 * @summary One choice among cards seen at once.
 */
function RadioCardField<TValue extends string>({
  id,
  name,
  legend,
  error,
  value,
  onValueChange,
  onBlur,
  options,
  required,
  hideLegend = false,
  inline = false,
  list = false,
}: RadioCardFieldProps<TValue>) {
  const ids = useFieldIds(id, name)
  const legendId = `${ids.id}-legend`

  return (
    <FieldSet
      data-invalid={error ? true : undefined}
      aria-describedby={error ? ids.errorId : undefined}
    >
      <FieldLegend
        id={legendId}
        className={cn(hideLegend && 'sr-only', error && 'text-danger-fg')}
      >
        {legend}
      </FieldLegend>
      <RadioGroup
        id={ids.id}
        name={name}
        aria-labelledby={legendId}
        required={required}
        value={value}
        onValueChange={(next) => onValueChange(next as TValue)}
        className={cn(
          inline && 'grid auto-cols-fr grid-flow-col gap-2',
          list && 'gap-0 overflow-hidden rounded-lg border border-field-line',
        )}
      >
        {options.map((option, index) => {
          const optionId = `${ids.id}-${option.value}`
          const OptionIcon = option.icon
          return (
            <FieldLabel
              key={option.value}
              htmlFor={optionId}
              className={cn(
                list
                  ? 'has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border-0'
                  : 'not-has-data-checked:border-field-line',
              )}
            >
              <Field
                orientation="horizontal"
                className={cn(
                  'min-h-11 items-center',
                  inline && 'gap-2',
                  list && 'flex-row-reverse justify-between',
                  list && index > 0 && 'border-t border-field-line',
                )}
              >
                <RadioGroupItem
                  id={optionId}
                  value={option.value}
                  onBlur={onBlur}
                  aria-invalid={error ? true : undefined}
                />
                {OptionIcon && (
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-fg"
                  >
                    <OptionIcon className="size-5" />
                  </span>
                )}
                <FieldTitle className="text-base font-normal">
                  {option.label}
                </FieldTitle>
              </Field>
            </FieldLabel>
          )
        })}
      </RadioGroup>
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </FieldSet>
  )
}

export { RadioCardField }
export type { RadioCardFieldProps }
