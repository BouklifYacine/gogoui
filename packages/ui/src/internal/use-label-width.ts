import { useCallback } from 'react'
import { animate, useMotionValue } from 'motion/react'
import type { AnimationPlaybackControls, MotionValue } from 'motion/react'

import { spring } from './motion.ts'

/**
 * A label frame's width that springs to the width of new words, so a button
 * morphs instead of snapping, after Arc UI (https://uiarc.dev, MIT). Put
 * the returned ref on a hidden copy of the words; a late web font or a
 * reflow follows at once, without a spring.
 */
export function useLabelWidth(
  reduce: boolean,
): [
  MotionValue<number | 'auto'>,
  (node: HTMLSpanElement | null) => (() => void) | undefined,
] {
  const width = useMotionValue<number | 'auto'>('auto')

  const measure = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      let lastText: string | null = null
      let sizing: AnimationPlaybackControls | null = null
      const observer = new ResizeObserver(([entry]) => {
        // The layout width, not the painted box: the new words are measured
        // while a pressed button is still scaled down.
        const next = entry?.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth
        const text = node.textContent
        const morph =
          lastText !== null &&
          lastText !== text &&
          !reduce &&
          typeof width.get() === 'number'
        lastText = text
        sizing?.stop()
        if (morph) {
          sizing = animate(width, next, spring.morph)
        } else {
          width.jump(next)
        }
      })
      observer.observe(node)
      return () => {
        observer.disconnect()
        sizing?.stop()
      }
    },
    [reduce, width],
  )

  return [width, measure]
}
