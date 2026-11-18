import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

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

type BadgeProps = useRender.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>

/**
 * A small round label: a count, a short state, a tag. A state is always
 * written in words, never told by colour alone. Rendered as a link
 * (`render={<a href="…" />}`), it darkens when pointed at.
 *
 * @summary A small pill for a count, a tag or a short state in words.
 */
function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge, badgeVariants }
export type { BadgeProps }
