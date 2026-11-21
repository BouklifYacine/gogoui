import type { Icon } from '@phosphor-icons/react'

import { useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { cn } from '../lib/cn.ts'
import { FieldError, FieldLegend, FieldSet } from './field.tsx'
import { RadioGroup, RadioGroupItem } from './radio-group.tsx'

type IconFieldProps<TValue extends string> = Omit<
  FieldValueProps<TValue>,
  'description'
> & {
  legend: string
  options: readonly { value: TValue; label: string; icon: Icon }[]
}

/**
 * One icon among square tiles.
 *
 * **Use it for** giving a category, a space or a resource its icon.
 *
 * **Key props**: `legend`, `options` (`{ value, label, icon }[]`), `value`
 * + `onValueChange`, `error`.
 *
 * **Accessibility**: each tile is named by its `label`, not its picture.
 *
 * @summary One icon among square tiles.
 */
function IconField<TValue extends string>({
  id,
  name,
  legend,
  error,
  value,
  onValueChange,
  onBlur,
  options,
}: IconFieldProps<TValue>) {
  const ids = useFieldIds(id, name)
  const legendId = `${ids.id}-legend`

  return (
    <FieldSet
      data-invalid={error ? true : undefined}
      aria-describedby={error ? ids.errorId : undefined}
    >
      <FieldLegend
        id={legendId}
        className={cn('w-full text-center', error && 'text-danger-fg')}
      >
        {legend}
      </FieldLegend>
      <RadioGroup
        id={ids.id}
        name={name}
        aria-labelledby={legendId}
        value={value}
        onValueChange={(next) => onValueChange(next as TValue)}
        className="mx-auto grid w-fit grid-cols-6 gap-2"
      >
        {options.map((option) => {
          const optionId = `${ids.id}-${option.value}`
          const OptionIcon = option.icon
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              title={option.label}
              className="relative flex size-12 cursor-pointer items-center justify-center rounded-xl bg-control text-fg-muted shadow-button transition-colors hover:bg-control-hover hover:text-fg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-line-focus has-data-checked:bg-primary has-data-checked:text-primary-foreground has-data-checked:shadow-primary"
            >
              <RadioGroupItem
                id={optionId}
                value={option.value}
                onBlur={onBlur}
                // Over the whole tile, unseen.
                className="absolute inset-0 size-full opacity-0"
              />
              <OptionIcon aria-hidden="true" className="size-5" />
              <span className="sr-only">{option.label}</span>
            </label>
          )
        })}
      </RadioGroup>
      <p aria-hidden="true" className="text-center text-sm text-fg-muted">
        {options.find((option) => option.value === value)?.label}
      </p>
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </FieldSet>
  )
}

export { IconField }
export type { IconFieldProps }
