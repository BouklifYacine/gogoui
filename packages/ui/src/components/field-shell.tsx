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
 * Label, help, error and their accessibility links, written once around
 * any control. GoGoUI's fields are built on it; use it for a control of
 * your own: `{(control) => <MyInput {...control} />}`.
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
