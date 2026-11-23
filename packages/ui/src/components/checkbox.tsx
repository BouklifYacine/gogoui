import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckboxMark } from '../internal/checkbox-mark.tsx'
import type { Color } from '../internal/colors.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
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
 * **Motion** (after Arc UI, https://uiarc.dev, MIT): the fill grows from
 * .6 while the tick draws itself, ticked ↔ indeterminate morphs the tick
 * into the dash, a press squeezes the box to .95. Still with reduced
 * motion.
 *
 * **Accessibility**: a `Label` with `htmlFor`; the hit area reaches 12 px
 * around the box.
 *
 * @summary A box to tick, with its label; indeterminate for a partial list.
 */
function Checkbox({
  className,
  color = 'primary',
  ...props
}: CheckboxPrimitive.Root.Props & {
  /** Its fill once ticked, the primary by default. */
  color?: Color
}) {
  return (
    <MotionScope>
      <CheckboxPrimitive.Root
        data-slot="checkbox"
        className={cn(
          'group/checkbox peer relative flex size-4 shrink-0 items-center justify-center rounded-xs bg-surface shadow-xs ring-1 ring-field-line outline-none forced-colors:border ring-inset transition-[box-shadow,scale] duration-(--motion-spring) ease-spring after:absolute after:-inset-3 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:duration-(--motion-instant) active:ease-standard motion-safe:active:not-data-disabled:scale-95 disabled:cursor-not-allowed disabled:bg-track disabled:shadow-none disabled:ring-0 aria-invalid:ring-danger data-checked:shadow-none data-indeterminate:shadow-none data-disabled:data-checked:opacity-60 data-disabled:data-indeterminate:opacity-60',
          className,
        )}
        {...props}
      >
        {/* Kept mounted, so the tick can draw itself out as well as in. */}
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          keepMounted
          className="absolute inset-0 flex items-center justify-center rounded-[inherit]"
          render={(indicatorProps, state) => (
            <span {...indicatorProps}>
              <CheckboxMark
                checked={state.checked}
                indeterminate={state.indeterminate}
                color={color}
              />
            </span>
          )}
        />
      </CheckboxPrimitive.Root>
    </MotionScope>
  )
}

export { Checkbox }
