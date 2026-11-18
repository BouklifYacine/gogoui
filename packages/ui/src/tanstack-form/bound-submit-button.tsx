import type { ComponentProps } from 'react'

import { SubmitButton } from '../components/submit-button.tsx'
import { useFormContext } from './form-context.ts'

/**
 * The form's submit button, busy while the TanStack form submits.
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
