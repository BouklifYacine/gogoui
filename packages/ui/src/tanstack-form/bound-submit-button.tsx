import type { ComponentProps } from 'react'

import { SubmitButton } from '../components/submit-button.tsx'
import { useFormContext } from './form-context.ts'

/**
 * A TanStack form's submit button, read from its state.
 *
 * **Use it for** `form.SubmitButton` inside `form.AppForm`: busy while the
 * form submits, every other prop of `SubmitButton` kept (`saved`,
 * `loadingText`…).
 *
 * @summary A TanStack form's submit button.
 */
export function BoundSubmitButton(
  props: Omit<ComponentProps<typeof SubmitButton>, 'submitting'>,
) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => <SubmitButton {...props} submitting={isSubmitting} />}
    </form.Subscribe>
  )
}
