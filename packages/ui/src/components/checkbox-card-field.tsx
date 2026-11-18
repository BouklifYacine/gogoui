import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
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
 * Several choices among cards, the twin of `RadioCardField`: the whole
 * card is the label, each box is ticked on its own. The value keeps the
 * ticked choices in the order of the options.
 *
 * @summary Several choices among cards seen at once.
 */
function CheckboxCardField<TValue extends string>({
  id,
  name,
  legend,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  options,
}: CheckboxCardFieldProps<TValue>) {
  const ids = useFieldIds(id, name)

  function toggle(choice: TValue, checked: boolean) {
    const ticked = new Set(value)
    if (checked) ticked.add(choice)
    else ticked.delete(choice)
    onValueChange(
      options.map((option) => option.value).filter((v) => ticked.has(v)),
    )
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
