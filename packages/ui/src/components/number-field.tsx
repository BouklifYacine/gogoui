import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'

type NumberFieldProps = Omit<NumberFieldPrimitive.Root.Props, 'locale'> & {
  /** The field's name for a screen reader when no label points at it. */
  'aria-label'?: string
  /** Its height: sm 32 px, default 36 px, lg 44 px; 44 px on a phone. */
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * A number with − and + around it (guests, a quantity): typed, stepped
 * with the buttons, the arrow keys or the wheel, kept between `min` and
 * `max`. Formatted in the language of GoGoUIProvider (`format` takes
 * Intl options: a currency, a percent). Point a `Label` at its `id`.
 *
 * @summary A number with − and + buttons.
 */
function NumberField({
  className,
  id,
  'aria-label': ariaLabel,
  size = 'default',
  ...props
}: NumberFieldProps) {
  const height = {
    sm: 'h-8 [&>button]:size-8',
    default: 'h-9 [&>button]:size-9',
    lg: 'h-11 text-base [&>button]:size-11',
  }[size]
  const messages = useGoGoUIMessages()
  const button =
    'flex shrink-0 items-center justify-center text-fg-muted transition-colors outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-line-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4'
  return (
    <NumberFieldPrimitive.Root
      data-slot="number-field"
      locale={messages.intlLocale}
      className={cn('w-fit', className)}
      {...props}
    >
      <NumberFieldPrimitive.Group
        className={cn(
          'flex items-center overflow-hidden rounded-button bg-field shadow-field focus-within:shadow-focus',
          height,
          'max-md:h-11 max-md:[&>button]:size-11',
        )}
      >
        <NumberFieldPrimitive.Decrement
          aria-label={messages.decrease}
          className={button}
        >
          <GoGoIcon name="minus" aria-hidden="true" />
        </NumberFieldPrimitive.Decrement>
        <NumberFieldPrimitive.Input
          id={id}
          aria-label={ariaLabel}
          className="h-full w-16 bg-transparent text-center text-base text-fg tabular-nums outline-none"
        />
        <NumberFieldPrimitive.Increment
          aria-label={messages.increase}
          className={button}
        >
          <GoGoIcon name="plus" aria-hidden="true" />
        </NumberFieldPrimitive.Increment>
      </NumberFieldPrimitive.Group>
    </NumberFieldPrimitive.Root>
  )
}

export { NumberField }
export type { NumberFieldProps }
