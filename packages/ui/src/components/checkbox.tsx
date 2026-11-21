import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { checked } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'

/**
 * A box to tick.
 *
 * **Use it for** a yes / no saved with a form, a consent, picking rows.
 * **Prefer** `CheckboxField` in a form (label, help and error included),
 * `Switch` for a setting that applies at once.
 *
 * **Where**: left of its label, always.
 *
 * **States**: unticked, ticked, indeterminate (some rows of a list),
 * disabled, invalid (`aria-invalid`).
 *
 * **Key props**: `checked` / `defaultChecked` + `onCheckedChange`,
 * `indeterminate`, `color` (the tick's fill).
 *
 * **Accessibility**: a `Label` with `htmlFor`; the hit area reaches 12 px
 * around the box.
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
        <GoGoIcon
          name="check"
          weight="bold"
          className="size-3 group-data-indeterminate/checkbox:hidden"
        />
        <GoGoIcon
          name="minus"
          weight="bold"
          className="hidden size-3 group-data-indeterminate/checkbox:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
