import type { ReactNode } from 'react'

import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { Field, FieldDescription, FieldError, FieldLabel } from './field.tsx'
import { Switch } from './switch.tsx'

type SwitchFieldProps = Omit<FieldValueProps<boolean>, 'description'> & {
  label: ReactNode
  description?: string
}

/**
 * A labelled on / off switch inside a form.
 *
 * **Use it for** turning a feature on in a form that has a « Save »
 * button. **Prefer** `SettingSwitchRow` for a setting that applies at
 * once, `CheckboxField` for a consent.
 *
 * **Key props**: `label`, `value` (boolean) + `onValueChange` (controlled)
 * or `defaultValue` (uncontrolled), `description`, `error`.
 *
 * @summary A labelled on/off switch inside a form.
 */
function SwitchField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = false,
  onValueChange,
  onBlur,
}: SwitchFieldProps) {
  const ids = useFieldIds(id, name)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="flex min-h-11 items-start justify-between gap-4">
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
        <Switch
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
      </div>
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </Field>
  )
}

export { SwitchField }
export type { SwitchFieldProps }
