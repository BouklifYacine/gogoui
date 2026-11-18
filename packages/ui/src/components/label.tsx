import * as React from 'react'

import { cn } from '../lib/cn.ts'

/**
 * The visible name of a field, linked to it with `htmlFor`. Every field
 * has one: a placeholder is not a label.
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
