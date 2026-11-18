import type { ComponentProps } from 'react'
import type { Icon } from '@phosphor-icons/react'

import { cn } from '../lib/cn.ts'
import { Input } from './input.tsx'

type InputWithIconProps = ComponentProps<typeof Input> & {
  /** A Phosphor icon drawn at the start of the field, decorative. */
  icon: Icon
}

/**
 * A text field with an icon at its start (a magnifier, an envelope). The
 * icon only decorates: the field's label still names it. For a button or
 * a text inside the field, use `InputGroup`.
 *
 * @summary A text field with a decorative icon at its start.
 */
function InputWithIcon({
  icon: FieldIcon,
  className,
  ...props
}: InputWithIconProps) {
  return (
    <div data-slot="input-with-icon" className="relative">
      <FieldIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-fg-subtle"
      />
      <Input className={cn('pl-10', className)} {...props} />
    </div>
  )
}

export { InputWithIcon }
export type { InputWithIconProps }
