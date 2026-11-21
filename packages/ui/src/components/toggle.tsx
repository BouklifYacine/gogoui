import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { pressed } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

const toggleVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-button text-sm font-medium whitespace-nowrap text-fg-muted transition-[color,background-color,box-shadow] outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-selected data-[pressed]:text-fg [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: '',
        outline:
          'bg-control shadow-button hover:bg-control-hover data-[pressed]:bg-selected',
      },
      size: {
        default: 'h-9 min-w-9 px-2.5 max-md:h-11 max-md:min-w-11',
        sm: 'h-8 min-w-8 px-2 max-md:h-11 max-md:min-w-11',
        lg: 'h-11 min-w-11 px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ToggleProps = TogglePrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    /** Its tint once pressed; grey by default. */
    color?: Color
  }

/**
 * A button that stays pressed.
 *
 * **Use it for** an on / off tool: bold, a favourite, « Afficher les
 * archivés ». **Prefer** `Switch` for a setting.
 *
 * **Key props**: `pressed` / `defaultPressed` + `onPressedChange`,
 * `variant` (default, outline), `size` (sm, default, lg), `color`.
 *
 * **Accessibility**: `aria-pressed`; an icon alone needs an `aria-label`.
 *
 * @summary A button that stays pressed.
 */
function Toggle({ className, variant, size, color, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(
        toggleVariants({ variant, size }),
        color && pressed[color],
        className,
      )}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
export type { ToggleProps }
