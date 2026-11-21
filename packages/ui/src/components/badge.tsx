import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { edge, solid, subtle, text } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

// A small pill, always round, figures in columns. Tinted badges draw
// their edge from their own text colour (shadow-badge).
const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2 text-xs font-medium whitespace-nowrap tabular-nums transition-[color,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground [a]:hover:bg-primary-hover',
        // The shapes a `color` paints.
        solid: 'bg-primary text-primary-foreground [a]:hover:bg-primary-hover',
        subtle: 'bg-primary-subtle text-primary-active shadow-badge',
        secondary:
          'bg-control text-fg-muted shadow-button [a]:hover:bg-control-hover',
        destructive:
          'bg-danger-subtle text-danger-fg shadow-badge [a]:hover:bg-danger-line',
        outline:
          'bg-transparent text-fg ring-1 ring-line ring-inset [a]:hover:bg-hover',
        ghost: 'hover:bg-hover hover:text-fg',
        link: 'text-primary-hover underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

/** The classes of a badge's shape in a colour, over the variant's own. */
function badgeColor(variant: BadgeVariant, color: Color): string {
  switch (variant) {
    case 'default':
    case 'solid':
      return cn(solid[color], 'shadow-none')
    case 'subtle':
    case 'destructive':
      return cn(subtle[color], 'shadow-badge ring-0')
    case 'outline':
      return cn(text[color], edge[color])
    default:
      return text[color]
  }
}

type BadgeProps = Omit<useRender.ComponentProps<'span'>, 'color'> &
  VariantProps<typeof badgeVariants> & {
    /**
     * The colour of its shape: `neutral`, `primary`, `info`, `success`,
     * `warning` or `danger`. `variant` keeps the shape.
     */
    color?: Color
  }

/**
 * A small round label.
 *
 * **Use it for** a count, a short state in words (« Payé », « En retard »),
 * a tag. **Not for** an action (`Button`) or a long text.
 *
 * **Where**: beside a title, in a table cell, on a card, in a tab.
 *
 * **States**: the shapes × the colours; as a link it darkens on hover.
 *
 * **Key props**: `variant` (solid, subtle, outline, ghost, link) and
 * `color` (neutral, primary, info, success, warning, danger):
 * `<Badge variant="subtle" color="success">Payé</Badge>`. `render` makes it
 * a link.
 *
 * **Accessibility**: the state is always written in words; never rely on
 * the colour alone.
 *
 * @summary A small pill for a count, a tag or a short state in words.
 */
function Badge({
  className,
  variant = 'default',
  color,
  render,
  ...props
}: BadgeProps) {
  const shape = variant ?? 'default'
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(
          badgeVariants({ variant: shape }),
          color && badgeColor(shape, color),
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
      color,
    },
  })
}

export { Badge, badgeVariants }
export type { BadgeProps }
