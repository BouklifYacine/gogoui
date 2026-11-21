import { ErrorSummary } from '../components/error-summary.tsx'
import { firstErrorMessage } from './first-error-message.ts'
import { useFormContext } from './form-context.ts'

/**
 * A TanStack form's error summary, from its fields' errors.
 *
 * **Use it for** `form.ErrorSummary` at the top of a long form.
 *
 * @summary A TanStack form's error summary.
 */
export function BoundErrorSummary({ className }: { className?: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe
      selector={(state) => [state.submissionAttempts, state.fieldMeta] as const}
    >
      {([attempts, fieldMeta]) => {
        if (attempts === 0) {
          return null
        }
        const errors = Object.entries(fieldMeta).flatMap(([name, meta]) => {
          const message = firstErrorMessage(
            (meta as { errors?: unknown[] } | undefined)?.errors ?? [],
          )
          return message ? [{ fieldId: name, message }] : []
        })
        return <ErrorSummary errors={errors} className={className} />
      }}
    </form.Subscribe>
  )
}
