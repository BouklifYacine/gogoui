import { useStore } from '@tanstack/react-form'
import type { ComponentProps } from 'react'

import { CodeField } from '../components/code-field.tsx'
import { firstErrorMessage } from './first-error-message.ts'
import { useFieldContext } from './form-context.ts'

/**
 * A TanStack form's code field, shaking again at each refused submit.
 *
 * **Use it for** `field.CodeField` in a sign-in step; value, error and
 * `attempt` come from the form.
 *
 * @summary A TanStack form's code field.
 */
export function BoundCodeField(
  props: Omit<
    ComponentProps<typeof CodeField>,
    'id' | 'name' | 'value' | 'onValueChange' | 'onBlur' | 'error' | 'attempt'
  >,
) {
  const field = useFieldContext<string>()
  const attempt = useStore(
    field.form.store,
    (state) => state.submissionAttempts,
  )
  return (
    <CodeField
      {...props}
      id={field.name}
      name={field.name}
      value={field.state.value}
      onValueChange={(value) => field.handleChange(value)}
      onBlur={field.handleBlur}
      error={firstErrorMessage(field.state.meta.errors)}
      attempt={attempt}
    />
  )
}
