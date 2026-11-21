import type { ComponentProps } from 'react'

import { cn } from '../lib/cn.ts'

type AspectRatioProps = ComponentProps<'div'> & {
  /** Width over height: 16 / 9, 4 / 3, 1. */
  ratio?: number
}

/**
 * A box that keeps its shape whatever its width.
 *
 * **Use it for** photos, videos, maps and their placeholders, so nothing
 * jumps when they load.
 *
 * **Where**: in a card, a grid of photos, a carousel slide.
 *
 * **Key props**: `ratio` (width over height: `16 / 9`, `4 / 3`, `1`). Its
 * child fills it (`object-cover` on an image).
 *
 * **Accessibility**: give the image inside its `alt`.
 *
 * @summary A box that keeps its shape.
 */
function AspectRatio({
  ratio = 16 / 9,
  className,
  style,
  ...props
}: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn(
        'relative w-full overflow-hidden *:size-full *:object-cover',
        className,
      )}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    />
  )
}

export { AspectRatio }
export type { AspectRatioProps }
