import { Meter as MeterPrimitive } from '@base-ui/react/meter'

import { fill } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

/**
 * A measure within a known range.
 *
 * **Use it for** a static amount: storage used, places taken, a quota.
 * **Not for** a task going on (`Progress`).
 *
 * **Where**: in a settings row, a card, a plan's limits.
 *
 * **Key props**: `value`, `min`, `max`, `color`; a visible label with the
 * number in words (« 12 sur 50 invités »).
 *
 * **Accessibility**: `role="meter"` with its value read aloud.
 *
 * @summary A measure within a range (storage, capacity).
 */
function Meter({
  className,
  children,
  color = 'primary',
  ...props
}: MeterPrimitive.Root.Props & {
  /** The bar's colour, the primary by default. */
  color?: Color
}) {
  return (
    <MeterPrimitive.Root
      data-slot="meter"
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}
      {...props}
    >
      {children}
      <MeterPrimitive.Track className="relative h-2 w-full overflow-hidden rounded-full bg-tray">
        <MeterPrimitive.Indicator
          className={cn('h-full rounded-full transition-all', fill[color])}
        />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  )
}

function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      data-slot="meter-label"
      className={cn('text-sm font-medium text-fg', className)}
      {...props}
    />
  )
}

function MeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      data-slot="meter-value"
      className={cn('ms-auto text-sm text-fg-muted tabular-nums', className)}
      {...props}
    />
  )
}

export { Meter, MeterLabel, MeterValue }
