import type { ReactNode } from 'react'

import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { Checkbox } from './checkbox.tsx'
import { Field, FieldDescription, FieldError, FieldLabel } from './field.tsx'

type CheckboxFieldProps = Omit<FieldValueProps<boolean>, 'description'> & {
  /** Beside the box; may hold a link (the terms to read before accepting). */
  label: ReactNode
  description?: string
}

/**
 * A labelled box to tick inside a form.
 *
 * **Use it for** a consent (« J'accepte les conditions »), an option saved
 * with the form. **Prefer** `SwitchField` for an on / off feature,
 * `CheckboxCardField` for several choices.
 *
 * **Key props**: `label`, `value` (boolean) + `onValueChange` (controlled)
 * or `defaultValue` (uncontrolled), `description`, `error`.
 *
 * **Accessibility**: the whole label ticks it; the error is read with it.
 *
 * @summary A labelled box to tick, for a consent.
 */
function CheckboxField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = false,
  onValueChange,
  onBlur,
}: CheckboxFieldProps) {
  const ids = useFieldIds(id, name)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="flex min-h-11 items-start gap-3">
        <Checkbox
          id={ids.id}
          name={name}
          checked={value}
          onCheckedChange={(checked) => setValue(checked)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(
            description && ids.descriptionId,
            error && ids.errorId,
          )}
          className="mt-0.5"
        />
        <div className="flex flex-col gap-0.5">
          <FieldLabel htmlFor={ids.id} className="block text-base font-normal">
            {label}
          </FieldLabel>
          {description && (
            <FieldDescription id={ids.descriptionId}>
              {description}
            </FieldDescription>
          )}
        </div>
      </div>
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </Field>
  )
}

export { CheckboxField }
export type { CheckboxFieldProps }
