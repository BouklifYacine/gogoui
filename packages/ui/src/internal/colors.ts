/*
 * The six colours a component can take, each drawn from the tokens so a
 * brand change follows everywhere and contrast stays checked (tokens.test).
 * Every class is written out in full: Tailwind finds them in the built
 * files only that way.
 */

export const COLORS = [
  'neutral',
  'primary',
  'info',
  'success',
  'warning',
  'danger',
] as const

/** A component's colour: neutral, primary, info, success, warning, danger. */
export type Color = (typeof COLORS)[number]

/** A filled shape: the colour, its words readable on it. */
export const solid: Record<Color, string> = {
  neutral: 'bg-neutral text-neutral-foreground shadow-xs hover:brightness-95',
  primary:
    'bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover',
  info: 'bg-info text-info-foreground shadow-xs hover:brightness-95',
  success: 'bg-success text-success-foreground shadow-xs hover:brightness-95',
  warning: 'bg-warning text-warning-foreground shadow-xs hover:brightness-95',
  danger: 'bg-danger text-danger-foreground shadow-danger hover:brightness-95',
}

/** A tinted shape: the colour's pale fill, its dark words, a thin edge. */
export const subtle: Record<Color, string> = {
  neutral:
    'bg-neutral-subtle text-neutral-fg ring-[0.5px] ring-neutral-line shadow-none',
  primary:
    'bg-primary-subtle text-primary-active ring-[0.5px] ring-primary-subtle-strong shadow-none',
  info: 'bg-info-subtle text-info-fg ring-[0.5px] ring-info-line shadow-none',
  success:
    'bg-success-subtle text-success-fg ring-[0.5px] ring-success-line shadow-none',
  warning:
    'bg-warning-subtle text-warning-fg ring-[0.5px] ring-warning-line shadow-none',
  danger:
    'bg-danger-subtle text-danger-fg ring-[0.5px] ring-danger-line shadow-none',
}

/** The tinted shape darkening when pointed at. */
export const subtleHover: Record<Color, string> = {
  neutral: 'hover:bg-neutral-line',
  primary: 'hover:bg-primary-subtle-strong',
  info: 'hover:bg-info-line',
  success: 'hover:bg-success-line',
  warning: 'hover:bg-warning-line',
  danger: 'hover:bg-danger-line',
}

/** Coloured words and icons, readable on the page (4.5:1). */
export const text: Record<Color, string> = {
  neutral: 'text-neutral-fg',
  primary: 'text-primary-active',
  info: 'text-info-fg',
  success: 'text-success-fg',
  warning: 'text-warning-fg',
  danger: 'text-danger-fg',
}

/** The pale fill a coloured outline or ghost shape takes when pointed at. */
export const hoverTint: Record<Color, string> = {
  neutral: 'hover:bg-neutral-subtle hover:text-neutral-fg',
  primary: 'hover:bg-primary-subtle hover:text-primary-active',
  info: 'hover:bg-info-subtle hover:text-info-fg',
  success: 'hover:bg-success-subtle hover:text-success-fg',
  warning: 'hover:bg-warning-subtle hover:text-warning-fg',
  danger: 'hover:bg-danger-subtle hover:text-danger-fg',
}

/** The colour's edge, for an outlined shape. */
export const edge: Record<Color, string> = {
  neutral: 'ring-1 ring-inset ring-neutral-line',
  primary: 'ring-1 ring-inset ring-primary-subtle-stronger',
  info: 'ring-1 ring-inset ring-info-line',
  success: 'ring-1 ring-inset ring-success-line',
  warning: 'ring-1 ring-inset ring-warning-line',
  danger: 'ring-1 ring-inset ring-danger-line',
}

/** A bar or a dot: the colour alone (progress, slider, step). */
export const fill: Record<Color, string> = {
  neutral: 'bg-neutral',
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

/** A box or a radio once ticked. */
export const checked: Record<Color, string> = {
  neutral:
    'data-checked:bg-neutral data-checked:text-neutral-foreground data-checked:ring-neutral data-indeterminate:bg-neutral data-indeterminate:text-neutral-foreground data-indeterminate:ring-neutral',
  primary:
    'data-checked:bg-primary data-checked:text-primary-foreground data-checked:ring-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:ring-primary',
  info: 'data-checked:bg-info data-checked:text-info-foreground data-checked:ring-info data-indeterminate:bg-info data-indeterminate:text-info-foreground data-indeterminate:ring-info',
  success:
    'data-checked:bg-success data-checked:text-success-foreground data-checked:ring-success data-indeterminate:bg-success data-indeterminate:text-success-foreground data-indeterminate:ring-success',
  warning:
    'data-checked:bg-warning data-checked:text-warning-foreground data-checked:ring-warning data-indeterminate:bg-warning data-indeterminate:text-warning-foreground data-indeterminate:ring-warning',
  danger:
    'data-checked:bg-danger data-checked:text-danger-foreground data-checked:ring-danger data-indeterminate:bg-danger data-indeterminate:text-danger-foreground data-indeterminate:ring-danger',
}

/** A switch once on. */
export const switchedOn: Record<Color, string> = {
  neutral: 'data-checked:bg-neutral',
  primary: 'data-checked:bg-primary',
  info: 'data-checked:bg-info',
  success: 'data-checked:bg-success',
  warning: 'data-checked:bg-warning',
  danger: 'data-checked:bg-danger',
}

/** A toggle once pressed. */
export const pressed: Record<Color, string> = {
  neutral: 'data-[pressed]:bg-neutral-subtle data-[pressed]:text-neutral-fg',
  primary:
    'data-[pressed]:bg-primary-subtle data-[pressed]:text-primary-active',
  info: 'data-[pressed]:bg-info-subtle data-[pressed]:text-info-fg',
  success: 'data-[pressed]:bg-success-subtle data-[pressed]:text-success-fg',
  warning: 'data-[pressed]:bg-warning-subtle data-[pressed]:text-warning-fg',
  danger: 'data-[pressed]:bg-danger-subtle data-[pressed]:text-danger-fg',
}

/** The words on a filled shape, for a tab's moving pill. */
export const onFill: Record<Color, string> = {
  neutral: 'data-active:text-neutral-foreground!',
  primary: 'data-active:text-primary-foreground!',
  info: 'data-active:text-info-foreground!',
  success: 'data-active:text-success-foreground!',
  warning: 'data-active:text-warning-foreground!',
  danger: 'data-active:text-danger-foreground!',
}
