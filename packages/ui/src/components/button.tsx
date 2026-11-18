import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import {
  hoverTint,
  solid,
  subtle,
  subtleHover,
  text,
} from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'
import { Spinner } from './spinner.tsx'

/*
 * Hover changes the colour only, a press squeezes it (scale .97, .94 for an
 * icon alone), the focus is a 2px outline 2px away. Solid fills carry their
 * own crisp shadow (a lit top line, a ring in their fill, two tight drops);
 * the white button is never a grey fill.
 */
const solidDisabledAtNight =
  'dark:disabled:bg-control dark:disabled:text-fg-disabled dark:disabled:opacity-100 dark:disabled:shadow-none'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-button text-sm font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,box-shadow,filter,scale] duration-150 ease-tactile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 aria-busy:cursor-progress aria-busy:opacity-60 aria-invalid:ring-1 aria-invalid:ring-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        // The single main action of a view.
        default: `bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover ${solidDisabledAtNight}`,
        // The shapes a `color` paints: filled, tinted (with outline,
        // ghost and link below).
        solid: `bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover ${solidDisabledAtNight}`,
        subtle:
          'bg-primary-subtle text-primary-active ring-[0.5px] ring-primary-subtle-strong hover:bg-primary-subtle-strong',
        // The white button, for the second action, on the grey page or a
        // white card. Only its colour moves when pointed at.
        outline:
          'bg-control text-fg shadow-button hover:bg-control-hover aria-expanded:bg-control-hover [&_svg]:text-fg-subtle',
        secondary:
          'bg-control text-fg shadow-button hover:bg-control-hover aria-expanded:bg-control-hover [&_svg]:text-fg-subtle',
        ghost:
          'bg-transparent text-fg-muted hover:bg-hover hover:text-fg aria-expanded:bg-hover aria-expanded:text-fg',
        // Small tools of a header or a table row: the white button, its
        // icon a step darker.
        soft: 'bg-control text-fg shadow-button hover:bg-control-hover aria-expanded:bg-control-hover [&_svg]:text-fg-muted',
        // The red trigger in a list that opens a confirmation.
        destructive:
          'bg-control text-danger-fg shadow-button hover:bg-danger-subtle aria-expanded:bg-danger-subtle',
        // The red that confirms, in a dialog: full red, white words.
        danger: `bg-danger text-danger-foreground shadow-danger hover:brightness-95 ${solidDisabledAtNight}`,
        link: 'text-primary-hover underline-offset-4 hover:underline active:not-aria-[haspopup]:scale-100',
        // Row buttons told apart by colour as well as by their word and
        // icon: change (blue), set aside (orange), bring back (green).
        info: 'bg-info-subtle text-info-fg ring-[0.5px] ring-info-line hover:bg-info-line',
        warning:
          'bg-warning-subtle text-warning-fg ring-[0.5px] ring-warning-line hover:bg-warning-line',
        success:
          'bg-success-subtle text-success-fg ring-[0.5px] ring-success-line hover:bg-success-line',
      },
      size: {
        // 36px at a desk, 44px under a thumb: every size a finger taps
        // reaches 44px on a phone.
        default:
          'h-9 px-4 max-md:h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        xs: 'h-7 gap-1 rounded-button-sm px-2 text-xs',
        sm: 'h-8 rounded-button-sm px-4 max-md:h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        lg: 'h-11 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-9 max-md:size-11 active:not-aria-[haspopup]:scale-[0.94]',
        'icon-xs':
          'size-7 rounded-button-sm active:not-aria-[haspopup]:scale-[0.94]',
        'icon-sm':
          'size-8 rounded-button-sm max-md:size-11 active:not-aria-[haspopup]:scale-[0.94]',
        'icon-lg': 'size-11 active:not-aria-[haspopup]:scale-[0.94]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

// The shape each variant has once a `color` paints it.
const shapeOf: Record<
  ButtonVariant,
  'solid' | 'subtle' | 'outline' | 'ghost' | 'link'
> = {
  default: 'solid',
  solid: 'solid',
  danger: 'solid',
  subtle: 'subtle',
  info: 'subtle',
  warning: 'subtle',
  success: 'subtle',
  outline: 'outline',
  secondary: 'outline',
  soft: 'outline',
  destructive: 'outline',
  ghost: 'ghost',
  link: 'link',
}

/** The classes of a shape in a colour, laid over the variant's own. */
function buttonColor(variant: ButtonVariant, color: Color): string {
  switch (shapeOf[variant]) {
    case 'solid':
      return solid[color]
    case 'subtle':
      return cn(subtle[color], subtleHover[color])
    case 'link':
      return text[color]
    default:
      // A white or a bare button: its words and icon take the colour.
      return cn(text[color], hoverTint[color], '[&_svg]:text-current')
  }
}

type ButtonProps = Omit<ButtonPrimitive.Props, 'color'> &
  VariantProps<typeof buttonVariants> & {
    /**
     * The colour of its shape: `neutral`, `primary`, `info`, `success`,
     * `warning` or `danger`. `variant` keeps the shape (solid, subtle,
     * outline, ghost, link).
     */
    color?: Color
    /**
     * Shows a spinner and blocks the click while keeping the focus, so a
     * screen reader stays on the button.
     */
    loading?: boolean
    /** Replaces the label while `loading` (« Envoi… »). */
    loadingText?: ReactNode
  }

/**
 * A button. `default` is the single main action of a view; `outline` the
 * second actions; `ghost` and `soft` the small tools; `destructive` opens a
 * confirmation and `danger` confirms it. Any shape takes a `color`
 * (`<Button variant="subtle" color="success">`). An icon alone takes an
 * `icon` size and an `aria-label`. To navigate, render a link:
 * `<Button render={<a href="/factures" />}>`.
 *
 * @summary The button: one `default` per view, variants for every other action.
 */
function Button({
  className,
  variant = 'default',
  size = 'default',
  color,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const shape = variant ?? 'default'
  return (
    <ButtonPrimitive
      data-slot="button"
      data-color={color}
      className={cn(
        buttonVariants({ variant: shape, size }),
        color && buttonColor(shape, color),
        className,
      )}
      disabled={disabled || loading}
      // While loading the button looks disabled (aria-busy greys it) but
      // keeps the focus: only the click is blocked.
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner aria-hidden="true" />}
      {loading && loadingText !== undefined ? loadingText : children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
export type { ButtonProps, Color }
