import type { ChevronProps } from 'react-day-picker'

import { cn } from '../lib/cn.ts'
import { GoGoIcon } from './gogo-icon.tsx'

const names = {
  left: 'chevronLeft',
  right: 'chevronRight',
  up: 'chevronUp',
  down: 'chevronDown',
} as const

/**
 * Calendar's arrows, drawn with GoGoUI's icons.
 *
 * @summary Internal: Calendar's `Chevron`.
 */
export function CalendarChevron({
  className,
  orientation = 'left',
  size: _size,
  disabled: _disabled,
  ...props
}: ChevronProps) {
  return (
    <GoGoIcon
      name={names[orientation]}
      aria-hidden="true"
      className={cn('size-4', className)}
      {...props}
    />
  )
}
