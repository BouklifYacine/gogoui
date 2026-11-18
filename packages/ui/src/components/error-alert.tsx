import type { ComponentProps } from 'react'

import { cn } from '../lib/cn.ts'

type ErrorAlertProps = ComponentProps<'p'>

/**
 * A refusal or a failure, in a red box, read aloud by screen readers as
 * soon as it shows. For an error about one field, use the field's own
 * message instead (`FieldError`).
 *
 * @summary A red box announcing a refusal or a failure.
 */
function ErrorAlert({ className, ...props }: ErrorAlertProps) {
  return (
    <p
      role="alert"
      data-slot="error-alert"
      className={cn(
        'rounded-lg border border-danger-line bg-danger-subtle px-4 py-3 text-sm text-danger-fg',
        className,
      )}
      {...props}
    />
  )
}

export { ErrorAlert }
export type { ErrorAlertProps }
