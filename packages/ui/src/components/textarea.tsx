import * as React from 'react'

import { cn } from '../lib/cn.ts'

/**
 * A text field of several lines.
 *
 * **Prefer** `TextareaField` in a form (label, counter, error).
 *
 * **States**: empty, filled, focus, disabled, invalid (`aria-invalid`). It
 * grows with its text.
 *
 * **Accessibility**: always a visible label.
 *
 * @summary A multi-line text field.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Same edge, shadow and focus as Input.
        'flex field-sizing-content min-h-16 w-full rounded-lg bg-field px-3 py-2 text-sm text-fg shadow-field ring-1 ring-field-line transition-[box-shadow,color] outline-none focus-visible:outline-hidden forced-colors:border ring-inset max-md:text-[16px] placeholder:text-fg-subtle hover:ring-fg-subtle focus-visible:shadow-focus focus-visible:ring-line-focus disabled:cursor-not-allowed disabled:bg-subtle disabled:text-fg-disabled disabled:shadow-none aria-invalid:ring-danger aria-invalid:focus-visible:shadow-focus-danger',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
