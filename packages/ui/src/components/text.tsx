import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { text as colorText } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    },
    tone: {
      default: 'text-fg',
      muted: 'text-fg-muted',
      subtle: 'text-fg-subtle',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
  },
  defaultVariants: { size: 'base', tone: 'default', weight: 'normal' },
})

type TextProps = Omit<useRender.ComponentProps<'p'>, 'color'> &
  VariantProps<typeof textVariants> & {
    /** A state's colour instead of the tone (an amount due in red). */
    color?: Color
    /** Figures in columns, for amounts and counts. */
    numeric?: boolean
  }

/**
 * Body text from the type scale.
 *
 * **Use it for** paragraphs, help lines, figures.
 *
 * **Key props**: `size` (xs, sm, base, lg), `tone` (default, muted,
 * subtle), `weight` (normal, medium, semibold), `color`, `numeric` (figures
 * of equal width, for amounts in columns), `render` (`<span />`,
 * `<label />`).
 *
 * **Accessibility**: muted and subtle tones keep a readable contrast; do
 * not go lighter.
 *
 * @summary Body text from the type scale.
 */
function Text({
  className,
  size,
  tone,
  weight,
  color,
  numeric = false,
  render,
  ...props
}: TextProps) {
  return useRender({
    defaultTagName: 'p',
    props: mergeProps<'p'>(
      {
        className: cn(
          textVariants({ size, tone, weight }),
          color && colorText[color],
          numeric && 'tabular-nums',
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: 'text' },
  })
}

export { Text, textVariants }
export type { TextProps }
