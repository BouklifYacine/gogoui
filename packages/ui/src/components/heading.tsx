import type { ComponentProps } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn.ts'

const headingVariants = cva('font-medium text-fg text-balance', {
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
 * A title with its place in the outline (`level`) and its look (`size`)
 * chosen apart: a small h2 in a panel, a big h1 on a landing. One h1 per
 * page; never skip a level for the look.
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
