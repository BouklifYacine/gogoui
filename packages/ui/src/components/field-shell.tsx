import type { ReactNode } from 'react'

import { describedBy, useFieldIds } from '../internal/field-props.ts'
import { FieldMessage } from '../internal/field-message.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { Field, FieldLabel } from './field.tsx'

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
  /**
   * Draws the control. `label.id` names a control whose focusable part is
   * not the element with `id`, such as a slider's thumb:
   * `aria-labelledby={label.id}`.
   */
  children: (control: FieldControlProps, label: { id: string }) => ReactNode
}

/**
 * Label, help and error around a control of your own.
 *
 * **Use it for** wrapping a control the library does not have, so it looks
 * and reads like the other fields. Every `…Field` of GoGoUI is built on it.
 *
 * **States**: no message, help, error, both. The help and the error slide
 * in under the control (after Arc UI): the row opens on a spring, then its
 * words rise into place; when the message changes, only the changed words
 * move and a count rolls its digits.
 *
 * **Key props**: `label`, `description`, `error`, `id`, `name`; children
 * is a function given the control's props:
 * `{(control) => <MyInput {...control} />}`.
 *
 * **Accessibility**: spread `control` on your element: it carries the
 * `id`, `aria-invalid` and `aria-describedby` that link it to its label,
 * help and error. The message is read as plain text once; it is not an
 * alert (it would interrupt at every key). With reduced motion it simply
 * appears.
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
    <MotionScope>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel id={`${ids.id}-label`} htmlFor={ids.id}>
          {label}
        </FieldLabel>
        {children(
          {
            id: ids.id,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy(
              description && ids.descriptionId,
              error && ids.errorId,
            ),
          },
          { id: `${ids.id}-label` },
        )}
        <FieldMessage
          id={ids.descriptionId}
          tone="muted"
          slot="field-description"
        >
          {description}
        </FieldMessage>
        <FieldMessage id={ids.errorId} tone="danger" slot="field-error">
          {error}
        </FieldMessage>
      </Field>
    </MotionScope>
  )
}

export { FieldShell }
export type { FieldControlProps, FieldShellProps }
