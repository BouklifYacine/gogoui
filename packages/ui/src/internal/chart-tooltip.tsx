import type { ReactNode } from 'react'
import { m } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { useChartGlide } from './use-chart-glide.ts'

export type ChartTooltipPlacement = {
  /** `after`: right of the anchor, flipped to its left near the edge. `center`: centred on it. */
  x?: 'after' | 'center'
  /** `center`: centred on the anchor. `above` or `below`: flipped when there is no room. */
  y?: 'center' | 'above' | 'below'
  /** Room between the anchor and the card, in px. */
  gap?: number
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))

/**
 * The floating card a hand-drawn chart shows beside a reading, after Arc
 * UI's charts (https://uiarc.dev, MIT): it fades in where it is needed,
 * then glides to each new reading on a spring and never leaves the plot.
 * It is drawn only (`aria-hidden`): the chart says the same reading in a
 * live region.
 *
 * Put it in the plot's positioned box; give it the anchor in that box's
 * px (null hides it, keeping its last words while it fades) and the box's
 * size. `instant` lands it at once, for a keyboard step.
 *
 * @summary Internal: a chart's tooltip card that follows the reading.
 */
export function ChartTooltip({
  anchor,
  bounds,
  placement = {},
  instant = false,
  className,
  children,
}: {
  /** The point read, in the plot's px; `height` when it is a mark the card must not cover (a cell). */
  anchor: { x: number; y: number; height?: number } | null
  bounds: { width: number; height: number }
  placement?: ChartTooltipPlacement
  instant?: boolean
  className?: string
  children: ReactNode
}) {
  const reduce = useReduceMotion()
  const left = useChartGlide()
  const top = useChartGlide()
  const { x = 'after', y = 'center', gap = 14 } = placement

  // Measured after each drawing, as its words change its size.
  const place = (node: HTMLDivElement | null) => {
    if (!node) {
      return
    }
    if (!anchor || !bounds.width) {
      left.moveTo(null)
      top.moveTo(null)
      return
    }
    const width = node.offsetWidth
    const height = node.offsetHeight
    let toX = x === 'center' ? anchor.x - width / 2 : anchor.x + gap
    if (x === 'after' && toX + width > bounds.width) {
      toX = anchor.x - gap - width
    }
    const bottom = anchor.y + (anchor.height ?? 0)
    let toY = anchor.y - height / 2
    if (y === 'above') {
      toY = anchor.y - gap - height
      if (toY < 0) {
        toY = bottom + gap
      }
    } else if (y === 'below') {
      toY = bottom + gap
      if (toY + height > bounds.height) {
        toY = anchor.y - gap - height
      }
    }
    left.moveTo(clamp(toX, 0, Math.max(0, bounds.width - width)), instant)
    top.moveTo(clamp(toY, 0, Math.max(0, bounds.height - height)), instant)
  }

  return (
    <m.div
      ref={place}
      aria-hidden="true"
      data-shown={anchor ? '' : undefined}
      style={{ x: left.value, y: top.value }}
      className={cn(
        'pointer-events-none absolute top-0 left-0 z-20 grid max-w-[min(16rem,100%)] min-w-36 gap-0.5 rounded-xl bg-floating px-3 py-2.5 text-sm text-fg opacity-0 shadow-menu ring-1 ring-line',
        'scale-96 transition-[opacity,scale] duration-150 ease-standard data-shown:scale-100 data-shown:opacity-100',
        reduce && 'transition-none',
        className,
      )}
    >
      {children}
    </m.div>
  )
}
