import { Input as InputPrimitive } from '@base-ui/react/input'
import type { ComponentProps } from 'react'

import { cn } from '../lib/cn.ts'

/**
 * A one-line text field. White, with its own edge visible at rest (3:1 on
 * the page); pointed at, only the edge darkens; focused, a dark edge and a
 * halo; `aria-invalid` turns it red. 16px text on a phone so iOS does not
 * zoom in on the focus. Always give it a visible label.
 *
 * @summary A text field; pair it with a label, `aria-invalid` for an error.
 */
function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-lg bg-field px-3 py-2 text-sm text-fg shadow-field ring-1 ring-field-line transition-[box-shadow,color] outline-none focus-visible:outline-hidden forced-colors:border ring-inset max-md:h-11 max-md:text-[16px] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg placeholder:text-fg-subtle hover:ring-fg-subtle focus-visible:shadow-focus focus-visible:ring-line-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-subtle disabled:text-fg-disabled disabled:shadow-none aria-invalid:ring-danger aria-invalid:focus-visible:shadow-focus-danger',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
