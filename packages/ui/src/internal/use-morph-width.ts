import { useCallback } from 'react'
import { animate, useMotionValue, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'

import { spring } from './motion.ts'

// How long after its words change a resize still counts as theirs.
const ARMED_MS = 700

/**
 * A width that springs to its content's new width when the content's words
 * change, after Arc UI (https://uiarc.dev, MIT). Any other resize (a font
 * arriving late, a parent reflowing) jumps, so nothing wobbles on the first
 * paint.
 *
 * Give the returned ref to the content (`flex-none`, so it keeps its own
 * width) and put its words in its `data-morph-key`; put the width on its
 * parent, which carries `data-morphing` while the spring runs (clip it
 * then). Never below 0, so a fold to nothing never pops back.
 */
export function useMorphWidth(
  reduce: boolean,
): [
  MotionValue<number | 'auto'>,
  (node: HTMLElement | null) => (() => void) | undefined,
] {
  const width = useMotionValue<number | 'auto'>('auto')
  const shown = useTransform(width, (value) =>
    typeof value === 'number' ? Math.max(0, value) : value,
  )

  // A callback ref: it starts watching with the content, stops with it.
  const measure = useCallback(
    (node: HTMLElement | null) => {
      const slot = node?.parentElement
      if (!node || !slot || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      let key = node.dataset.morphKey
      let armedUntil = 0
      let measured = false
      const observer = new ResizeObserver(([entry]) => {
        const next = entry?.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth
        if (node.dataset.morphKey !== key) {
          key = node.dataset.morphKey
          armedUntil = performance.now() + ARMED_MS
        }
        if (!next || !measured || reduce || performance.now() > armedUntil) {
          measured = next > 0
          width.jump(next || 'auto')
          delete slot.dataset.morphing
          return
        }
        slot.dataset.morphing = ''
        animate(width, next, {
          ...spring.morph,
          onComplete: () => {
            delete slot.dataset.morphing
          },
        })
      })
      observer.observe(node, { box: 'border-box' })
      return () => observer.disconnect()
    },
    [reduce, width],
  )

  return [shown, measure]
}
