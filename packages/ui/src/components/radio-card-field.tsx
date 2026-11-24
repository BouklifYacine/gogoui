import type { ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'

import type { Color } from '../internal/colors.ts'
import { useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { RadioCardRing } from '../internal/radio-card-ring.tsx'
import { cn } from '../lib/cn.ts'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from './field.tsx'
import { RadioGroup, RadioGroupItem } from './radio-group.tsx'

type RadioCardOption<TValue extends string> = {
  value: TValue
  label: string
  /** An icon gives the card a tinted tile before its label. */
  icon?: Icon
  /** One or two short lines under the label. */
  description?: ReactNode
  /** A price or an estimate: under the text in a card, at the end of a list row. */
  meta?: ReactNode
  disabled?: boolean
  /** Why it cannot be chosen, shown in place of the description. */
  disabledReason?: ReactNode
}

type RadioCardFieldProps<TValue extends string> = Omit<
  FieldValueProps<TValue | ''>,
  'description'
> & {
  legend: string
  options: readonly RadioCardOption<TValue>[]
  /** Said to screen readers; the look stays the same. */
  required?: boolean
  /** For screen readers only, when the page title already asks it. */
  hideLegend?: boolean
  /** Two or three one-word choices side by side, on a phone too. */
  inline?: boolean
  /** Many one-line choices as one framed list, the radio on the right. */
  list?: boolean
  /** Cards side by side, as many as fit this width (px) each. */
  minColumnWidth?: number
  /** The ring and the dot of the chosen card, the primary by default. */
  color?: Color
}

/**
 * One choice among cards seen at once.
 *
 * **Use it for** 2 to 5 options where an icon, a sentence or a price
 * helps: a type of event, a plan, a payment mode. **Not for** plain short
 * options (`RadioGroup`) or more than 5 (`SelectField`).
 *
 * **Where**: in a form, stacked, side by side (`inline`,
 * `minColumnWidth`) or as a framed list (`list`).
 *
 * **States**: none chosen, chosen, disabled option (with its reason),
 * invalid.
 *
 * **Key props**: `legend`, `options` (`{ value, label, icon?,
 * description?, meta?, disabled?, disabledReason? }[]`), `value` +
 * `onValueChange` (controlled) or `defaultValue` (uncontrolled), `error`,
 * `required`, `hideLegend`, `inline` (in a row), `list` (stacked lines),
 * `minColumnWidth` (a responsive grid), `color`.
 *
 * **Motion** (after Arc UI, https://uiarc.dev, MIT): one ring glides from
 * the chosen card to the next, over its edge so no card changes size; the
 * dot springs in. A resize puts the ring back without a glide; with
 * reduced motion it moves at once.
 *
 * **Accessibility**: a fieldset with its legend; one tab stop, arrows move
 * the choice; a description or a reason is read with its option.
 *
 * @summary One choice among cards seen at once.
 */
function RadioCardField<TValue extends string>({
  id,
  name,
  legend,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  options,
  required,
  hideLegend = false,
  inline = false,
  list = false,
  minColumnWidth,
  color = 'primary',
}: RadioCardFieldProps<TValue>) {
  const ids = useFieldIds(id, name)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const legendId = `${ids.id}-legend`
  const grid = !inline && !list && minColumnWidth !== undefined

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
        onValueChange={(next) => setValue(next as TValue)}
        style={
          grid
            ? {
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minColumnWidth}px), 1fr))`,
              }
            : undefined
        }
        className={cn(
          'group/radio-cards relative',
          inline && 'grid auto-cols-fr grid-flow-col gap-2',
          list && 'gap-0 overflow-hidden rounded-lg border border-field-line',
        )}
      >
        <RadioCardRing color={color} square={list} />
        {options.map((option, index) => {
          const optionId = `${ids.id}-${option.value}`
          const descriptionId = `${optionId}-description`
          const OptionIcon = option.icon
          const description =
            option.disabled && option.disabledReason
              ? option.disabledReason
              : option.description
          const details = Boolean(description || (option.meta && !list))
          return (
            <FieldLabel
              key={option.value}
              htmlFor={optionId}
              className={cn(
                list
                  ? 'has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border-0'
                  : 'not-has-data-checked:border-field-line',
                // Once the ring is there, it alone draws the chosen edge.
                !list &&
                  'group-data-ring-ready/radio-cards:has-data-checked:border-field-line',
                option.disabled && 'cursor-not-allowed',
              )}
            >
              <Field
                orientation="horizontal"
                data-disabled={option.disabled ? true : undefined}
                className={cn(
                  'min-h-11 flex-1',
                  !details && 'has-[>[data-slot=field-content]]:items-center',
                  inline && 'gap-2',
                  list && index > 0 && 'border-t border-field-line',
                )}
              >
                <RadioGroupItem
                  id={optionId}
                  value={option.value}
                  color={color}
                  disabled={option.disabled}
                  onBlur={onBlur}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={description ? descriptionId : undefined}
                  className={cn(list && 'order-last', details && 'mt-[3px]!')}
                />
                {OptionIcon && (
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-fg"
                  >
                    <OptionIcon className="size-5" />
                  </span>
                )}
                <FieldContent className="min-w-0 self-stretch">
                  <FieldTitle
                    className={cn(
                      'text-base font-normal',
                      option.disabled && 'text-fg-muted',
                    )}
                  >
                    {option.label}
                  </FieldTitle>
                  {description && (
                    <span
                      id={descriptionId}
                      className="text-sm text-pretty text-fg-muted"
                    >
                      {description}
                    </span>
                  )}
                  {option.meta && !list && (
                    // Pushed to the card's foot, so prices side by side
                    // share one line even when a description wraps.
                    <span className="mt-auto pt-2 text-lg font-medium whitespace-nowrap text-fg tabular-nums">
                      {option.meta}
                    </span>
                  )}
                </FieldContent>
                {option.meta && list && (
                  <span className="shrink-0 self-center font-medium whitespace-nowrap text-fg tabular-nums">
                    {option.meta}
                  </span>
                )}
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
export type { RadioCardFieldProps, RadioCardOption }
