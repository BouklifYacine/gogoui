import type { ComponentProps } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn.ts'

// No colour of its own: it takes its parent's, so it reads on a dark band too.
const headingVariants = cva('font-medium text-balance', {
  variants: {
    size: {
      '3xl': 'text-3xl tracking-title',
      '2xl': 'text-2xl tracking-title',
      xl: 'text-xl tracking-heading',
      lg: 'text-lg',
      base: 'text-base',
    },
  },
  defaultVariants: { size: 'xl' },
})

type HeadingProps = ComponentProps<'h2'> &
  VariantProps<typeof headingVariants> & {
    /** Its place in the page's outline: 1 the page, 2 a part, 3 inside it. */
    level?: 1 | 2 | 3 | 4
  }

/**
 * A title whose level (for the page's outline) and size (for the eye) are
 * chosen apart.
 *
 * **Use it for** every title that is not a page's own (`PageHeading`) or a
 * card's (`CardTitle`): a section, a dialog body, a landing block.
 *
 * **Where**: one `level={1}` per page; then 2 for its sections, 3 inside
 * them. Never skip a level to get a smaller size: change `size`.
 *
 * **Key props**: `level` (1 to 4, the tag), `size` (3xl, 2xl, xl, lg, base).
 *
 * **Accessibility**: screen-reader users jump between headings; the levels
 * must tell the page's outline.
 *
 * @summary A title, its level and its size chosen apart.
 */
function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const
  return (
    <Tag
      data-slot="heading"
      className={cn(headingVariants({ size }), className)}
      {...props}
    />
  )
}

export { Heading, headingVariants }
export type { HeadingProps }
