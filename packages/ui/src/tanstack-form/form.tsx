import type { ReactNode } from 'react'

import { focusField } from '../components/error-summary.tsx'
import { firstErrorMessage } from './first-error-message.ts'
import { useFormContext } from './form-context.ts'

/**
 * The `<form>` element: no browser bubbles, TanStack submits. A date typed
 * but refused stops the submit and takes the focus. A refused submit puts
 * the focus on the error summary when there is one, else on the first
 * field in error, so a screen reader reads what to fix.
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
