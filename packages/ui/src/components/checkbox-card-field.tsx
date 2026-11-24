import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { cn } from '../lib/cn.ts'
import { Checkbox } from './checkbox.tsx'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from './field.tsx'

type CheckboxCardFieldProps<TValue extends string> = Omit<
  FieldValueProps<TValue[]>,
  'description'
> & {
  legend: string
  /** Under the legend, such as « Plusieurs réponses possibles ». */
  description?: string
  options: readonly { value: TValue; label: string }[]
}

/**
 * Several choices among cards seen at once.
 *
 * **Use it for** services offered, days open, rooms included.
 *
 * **Key props**: `legend`, `options` (`{ value, label }[]`), `value` (an
 * array) + `onValueChange` (controlled) or `defaultValue` (uncontrolled),
 * `description`, `error`.
 *
 * **Accessibility**: a fieldset with its legend; each card is a checkbox.
 *
 * @summary Several choices among cards seen at once.
 */
function CheckboxCardField<TValue extends string>({
  id,
  name,
  legend,
  description,
  error,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  onBlur,
  options,
}: CheckboxCardFieldProps<TValue>) {
  const ids = useFieldIds(id, name)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  function toggle(choice: TValue, checked: boolean) {
    const ticked = new Set(value)
    if (checked) ticked.add(choice)
    else ticked.delete(choice)
    setValue(options.map((option) => option.value).filter((v) => ticked.has(v)))
  }

  return (
    <FieldSet
      data-invalid={error ? true : undefined}
      aria-describedby={describedBy(
        description && ids.descriptionId,
        error && ids.errorId,
      )}
    >
      <FieldLegend className={cn(error && 'text-danger-fg')}>
        {legend}
      </FieldLegend>
      {description && (
        <FieldDescription id={ids.descriptionId}>
          {description}
        </FieldDescription>
      )}
      <div className="grid w-full gap-2">
        {options.map((option, index) => {
          // The first box takes the field's id: an error link lands on it.
          const optionId = index === 0 ? ids.id : `${ids.id}-${option.value}`
          return (
            <FieldLabel key={option.value} htmlFor={optionId}>
              <Field orientation="horizontal" className="min-h-11">
                <Checkbox
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) => toggle(option.value, checked)}
                  onBlur={onBlur}
                  aria-invalid={error ? true : undefined}
                />
                <FieldTitle className="text-base font-normal">
                  {option.label}
                </FieldTitle>
              </Field>
            </FieldLabel>
          )
        })}
      </div>
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </FieldSet>
  )
}

export { CheckboxCardField }
export type { CheckboxCardFieldProps }
