import type { ReactNode } from 'react'

import { focusField } from '../components/error-summary.tsx'
import { firstErrorMessage } from './first-error-message.ts'
import { useFormContext } from './form-context.ts'

/**
 * A TanStack form's `form` element.
 *
 * **Use it for** the outer element of a `useAppForm` form: it submits,
 * blocks the browser's own checks and moves the focus to the first error.
 *
 * **Compose**: `const form = useAppForm({...})` then `<form.AppForm><Form>
 * <form.AppField name="email">{(field) => <field.TextField label="E-mail"
 * />}</form.AppField> <form.SubmitButton>Enregistrer</form.SubmitButton>
 * </Form></form.AppForm>`.
 *
 * @summary A TanStack form's element, focusing the first error.
 */
export function Form({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const form = useFormContext()
  return (
    <form
      noValidate
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        const refusedDay = event.currentTarget.querySelector<HTMLElement>(
          '[data-typed-invalid]',
        )
        if (refusedDay) {
          refusedDay.focus()
          return
        }
        void form.handleSubmit().then(() => {
          if (form.state.isValid) {
            return
          }
          // Drawn with the refusal: wait for the next frame.
          requestAnimationFrame(() => {
            const summary = document.getElementById('error-summary')
            if (summary) {
              summary.focus()
              return
            }
            const firstInvalid = Object.entries(form.state.fieldMeta).find(
              ([, meta]) =>
                firstErrorMessage(
                  (meta as { errors?: unknown[] } | undefined)?.errors ?? [],
                ),
            )
            if (firstInvalid) {
              focusField(firstInvalid[0])
            }
          })
        })
      }}
    >
      {children}
    </form>
  )
}
