import type { ComponentProps } from 'react'

import { cn } from '../lib/cn.ts'

type ErrorAlertProps = ComponentProps<'p'>

/**
 * A refusal or a failure, in a red box, read aloud.
 *
 * **Use it for** a server's refusal on a whole form, a failed action in a
 * dialog. **Not for** one field's error (the field's `error`); for other
 * states use `Alert`.
 *
 * **Where**: above the form's buttons or at the top of the dialog.
 *
 * **Accessibility**: `role="alert"`: read as soon as it shows. Say what to
 * do next.
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
