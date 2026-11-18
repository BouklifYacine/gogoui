import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'

import { pressed } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

/**
 * A few choices side by side, one pressed (« Jour · Semaine · Mois »), on
 * a tray where the chosen one stands out; `multiple` lets several be
 * pressed. The value is a list of the pressed items' values. The arrow
 * keys move between them. Give the group an `aria-label`.
 *
 * @summary A segmented choice among a few buttons.
 */
function ToggleGroup({ className, ...props }: ToggleGroupPrimitive.Props) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-full bg-tray p-1',
        className,
      )}
      {...props}
    />
  )
}

function ToggleGroupItem({
  className,
  color,
  ...props
}: TogglePrimitive.Props & {
  /** Its tint once pressed; white by default. */
  color?: Color
}) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium whitespace-nowrap text-fg-muted transition-[color,background-color,box-shadow] outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-line-focus disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-control data-[pressed]:text-fg data-[pressed]:shadow-button max-md:h-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        color && pressed[color],
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
