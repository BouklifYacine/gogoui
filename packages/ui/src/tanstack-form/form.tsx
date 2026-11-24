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
      // Sent before the page's script is ready, a form without a method
      // goes out as a GET: its fields, a password included, land in the
      // address, the history and the server's logs. POST keeps them out.
      method="post"
      noValidate
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        // Kept: currentTarget is gone once the submit's promise settles.
        const formElement = event.currentTarget
        const refusedDay = formElement.querySelector<HTMLElement>(
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
            // This form's own summary: two forms on a page each have one.
            const summary = formElement.querySelector<HTMLElement>(
              '[data-slot="error-summary"]',
            )
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
