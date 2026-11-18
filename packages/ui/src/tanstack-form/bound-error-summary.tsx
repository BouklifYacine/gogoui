import { ErrorSummary } from '../components/error-summary.tsx'
import { firstErrorMessage } from './first-error-message.ts'
import { useFormContext } from './form-context.ts'

/**
 * Every error of the TanStack form, after a refused submit, following the
 * fixes as they are typed. For a long form (six fields or more).
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
