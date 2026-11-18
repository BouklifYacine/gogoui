import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn.ts'

const stackVariants = cva('flex', {
  variants: {
    direction: {
      column: 'flex-col',
      row: 'flex-row',
      // A row from a tablet up, a column on a phone.
      responsive: 'flex-col md:flex-row',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
      12: 'gap-12',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    wrap: { true: 'flex-wrap', false: 'flex-nowrap' },
  },
  defaultVariants: { direction: 'column', gap: 4 },
})

type StackProps = useRender.ComponentProps<'div'> &
  VariantProps<typeof stackVariants>

/**
 * Things one under the other, or side by side, a set gap between them
 * (the spacing scale: 1 is 4 px, 4 is 16 px). `direction="responsive"`
 * puts them side by side from a tablet up. A div by default.
 *
 * @summary Things in a column or a row with a set gap.
 */
function Stack({
  className,
  direction,
  gap,
  align,
  justify,
  wrap,
  render,
  ...props
}: StackProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          stackVariants({ direction, gap, align, justify, wrap }),
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: 'stack' },
  })
}

export { Stack, stackVariants }
export type { StackProps }
