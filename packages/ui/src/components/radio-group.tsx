import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { checked } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

/**
 * One choice among two to five, all seen at once. Each `RadioGroupItem`
 * has its own label. For six choices or more, prefer a Select.
 *
 * @summary Pick one of a few options, all visible.
 */
function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  color,
  ...props
}: RadioPrimitive.Root.Props & {
  /** Its fill once chosen, the primary by default. */
  color?: Color
}) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        'group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full bg-surface shadow-xs ring-1 ring-field-line outline-none focus-visible:outline-hidden forced-colors:border ring-inset transition-[background-color,box-shadow] after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:shadow-focus-primary disabled:cursor-not-allowed disabled:bg-track disabled:shadow-none disabled:ring-0 aria-invalid:ring-danger data-checked:bg-primary data-checked:text-primary-foreground data-checked:ring-primary',
        color && checked[color],
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
