import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { m } from 'motion/react'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { checked } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { duration, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

/**
 * One choice among a few, all visible.
 *
 * **Use it for** 2 to 5 options to compare (a payment mode, a delivery).
 * **Prefer** `RadioCardField` when each option needs a sentence,
 * `SelectField` beyond 5, `ToggleGroup` for a view switch.
 *
 * **Where**: in a form, stacked.
 *
 * **States**: unchosen, chosen, disabled item, invalid.
 *
 * **Key props**: `value` / `defaultValue` + `onValueChange`; `color` on
 * `RadioGroupItem`.
 *
 * **Motion** (after Arc UI, https://uiarc.dev, MIT): the chosen dot springs
 * in from .4 while the old one shrinks away; a press dips the circle to
 * .88 and shows a faint dot. Still with reduced motion.
 *
 * **Accessibility**: wrap it in a fieldset with a legend; arrows move the
 * choice.
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
  const reduce = useReduceMotion()
  return (
    <MotionScope>
      <RadioPrimitive.Root
        data-slot="radio-group-item"
        className={cn(
          'group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full bg-surface shadow-xs ring-1 ring-field-line outline-none forced-colors:border ring-inset transition-[background-color,box-shadow,scale] duration-(--motion-spring) ease-spring after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:duration-(--motion-instant) active:ease-standard motion-safe:active:not-data-disabled:scale-[0.88] disabled:cursor-not-allowed disabled:bg-track disabled:shadow-none disabled:ring-0 aria-invalid:ring-danger data-checked:bg-primary data-checked:text-primary-foreground data-checked:ring-primary',
          // A faint dot previews the choice while the pointer is down.
          'before:absolute before:top-1/2 before:left-1/2 before:size-2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-fg before:opacity-0 before:transition-opacity before:duration-100 active:not-data-checked:not-data-disabled:before:opacity-22',
          color && checked[color],
          className,
        )}
        {...props}
      >
        {/* Kept mounted, so the dot can shrink away as well as spring in. */}
        <RadioPrimitive.Indicator
          data-slot="radio-group-indicator"
          keepMounted
          className="flex size-4 items-center justify-center"
          render={(indicatorProps, state) => (
            <span {...indicatorProps}>
              <m.span
                initial={false}
                animate={
                  state.checked
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0.4, opacity: 0 }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        ...spring.snappy,
                        opacity: {
                          duration: state.checked
                            ? duration.fast
                            : duration.instant,
                        },
                      }
                }
                className="absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full bg-current"
              />
            </span>
          )}
        />
      </RadioPrimitive.Root>
    </MotionScope>
  )
}

export { RadioGroup, RadioGroupItem }
