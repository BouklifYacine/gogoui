import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon, MinusIcon } from '@phosphor-icons/react'
import { checked } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

/**
 * A box to tick, for a yes/no saved with a form or for picking rows of a
 * list: white with the field's edge (3:1 on the page, day and night),
 * filled with the primary once ticked. Half-ticked (`indeterminate`, some
 * rows of a list), the same fill with a dash. Its hit area reaches 12px
 * around it for a thumb. Always next to its label.
 *
 * @summary A box to tick, with its label; indeterminate for a partial list.
 */
function Checkbox({
  className,
  color,
  ...props
}: CheckboxPrimitive.Root.Props & {
  /** Its fill once ticked, the primary by default. */
  color?: Color
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group/checkbox peer relative flex size-4 shrink-0 items-center justify-center rounded-xs bg-surface shadow-xs ring-1 ring-field-line outline-none focus-visible:outline-hidden forced-colors:border ring-inset transition-[background-color,box-shadow] after:absolute after:-inset-3 focus-visible:shadow-focus-primary disabled:cursor-not-allowed disabled:bg-track disabled:shadow-none disabled:ring-0 aria-invalid:ring-danger data-checked:bg-primary data-checked:text-primary-foreground data-checked:ring-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:ring-primary',
        color && checked[color],
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon
          weight="bold"
          className="size-3 group-data-indeterminate/checkbox:hidden"
        />
        <MinusIcon
          weight="bold"
          className="hidden size-3 group-data-indeterminate/checkbox:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
