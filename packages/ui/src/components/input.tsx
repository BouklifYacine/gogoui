import { Input as InputPrimitive } from '@base-ui/react/input'
import type { ComponentProps } from 'react'

import { cn } from '../lib/cn.ts'

/**
 * A one-line text field.
 *
 * **Prefer** `TextField` in a form (label, help and error included).
 *
 * **States**: empty (placeholder), filled, hover (the edge darkens),
 * focus (the edge turns to the focus colour, no halo, after Arc UI: 150ms),
 * disabled, invalid (`aria-invalid`, red edge).
 *
 * **Key props**: `size` (sm, default, lg), `type`, `autoComplete`,
 * `inputMode` (the phone's keyboard).
 *
 * **Accessibility**: always a visible label; 16 px text on a phone so iOS
 * does not zoom.
 *
 * @summary A text field; pair it with a label, `aria-invalid` for an error.
 */
function Input({
  className,
  type,
  size = 'default',
  ...props
}: Omit<ComponentProps<'input'>, 'size'> & {
  /** Its height: sm 32 px, default 36 px, lg 44 px; 44 px on a phone. */
  size?: 'sm' | 'default' | 'lg'
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        'data-[size=sm]:h-8 data-[size=lg]:h-11 data-[size=lg]:text-base h-9 w-full min-w-0 rounded-lg bg-field px-3 py-2 text-sm text-fg shadow-field ring-1 ring-field-line transition-[box-shadow,color] duration-150 ease-standard outline-none motion-reduce:transition-none focus-visible:outline-hidden forced-colors:border ring-inset max-md:h-11 max-md:text-[16px] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg placeholder:text-fg-subtle hover:ring-fg-subtle focus-visible:ring-line-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-subtle disabled:text-fg-disabled disabled:shadow-none aria-invalid:ring-danger',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
