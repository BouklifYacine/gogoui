import type { ReactNode } from 'react'

import { describedBy, useFieldIds } from '../internal/field-props.ts'
import { Field, FieldDescription, FieldError, FieldLabel } from './field.tsx'

/** What the control inside the shell must carry to be labelled and read. */
type FieldControlProps = {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

type FieldShellProps = {
  id?: string
  name?: string
  label: string
  description?: ReactNode
  error?: string
  children: (control: FieldControlProps) => ReactNode
}

/**
 * Label, help and error around a control of your own.
 *
 * **Use it for** wrapping a control the library does not have, so it looks
 * and reads like the other fields.
 *
 * **Key props**: `label`, `description`, `error`, `id`, `name`; children
 * is a function given the control's props:
 * `{(control) => <MyInput {...control} />}`.
 *
 * **Accessibility**: spread `control` on your element: it carries the
 * `id`, `aria-invalid` and `aria-describedby` that link it to its label,
 * help and error.
 *
 * @summary Label, help and error around a control of your own.
 */
function FieldShell({
  id,
  name,
  label,
  description,
  error,
  children,
}: FieldShellProps) {
  const ids = useFieldIds(id, name)

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={ids.id}>{label}</FieldLabel>
      {children({
        id: ids.id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy(
          description && ids.descriptionId,
          error && ids.errorId,
        ),
      })}
      {description && (
        <FieldDescription id={ids.descriptionId}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </Field>
  )
}

export { FieldShell }
export type { FieldControlProps, FieldShellProps }
