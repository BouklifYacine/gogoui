import * as React from 'react'

import { cn } from '../lib/cn.ts'

/**
 * The visible name of a form field.
 *
 * **Use it for** a control you place yourself; the ready fields already
 * have one.
 *
 * **Where**: above a text field, right of a checkbox or a switch.
 *
 * **Key props**: `htmlFor` (the control's `id`).
 *
 * **Accessibility**: a click on it focuses or ticks the control; never
 * replace it with a placeholder.
 *
 * @summary The visible name of a form field.
 */
function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-base leading-snug font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
