import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import { useCallback, useState } from 'react'

import { cn } from '../lib/cn.ts'

// The highlight's two edges: the one facing the move is stiff, the other
// soft, so it stretches from row to row.
const lead = { type: 'spring', stiffness: 620, damping: 36 } as const
const trail = { type: 'spring', stiffness: 200, damping: 20 } as const

/**
 * The soft highlight under the row pointed at or reached with the arrows,
 * stretching from one row to the next. It reads Base UI's own
 * data-highlighted, so the keyboard and the pointer move it alike.
 *
 * @summary Internal: the sliding highlight of SelectContent.
 */
export function SelectHighlight() {
  const reduce = useReducedMotion()
  const top = useMotionValue(0)
  const bottom = useMotionValue(0)
  const height = useTransform(() => Math.max(0, bottom.get() - top.get()))
  const [shown, setShown] = useState(false)

  // Watches the rows from a plain marker beside the highlight: it starts
  // when the menu opens, stops when it closes.
  const followRows = useCallback(
    (marker: HTMLSpanElement | null) => {
      const popup = marker?.parentElement
      if (!popup) {
        return undefined
      }
      let at: HTMLElement | null = null
      const follow = () => {
        const row = popup.querySelector<HTMLElement>(
          "[data-slot='select-item'][data-highlighted]",
        )
        setShown(row !== null)
        if (!row || row === at) {
          return
        }
        const from = row.offsetTop
        const to = from + row.offsetHeight
        if (!at || reduce) {
          top.jump(from)
          bottom.jump(to)
        } else {
          const down = from > at.offsetTop
          animate(top, from, down ? trail : lead)
          animate(bottom, to, down ? lead : trail)
        }
        at = row
      }
      follow()
      const observer = new MutationObserver(follow)
      observer.observe(popup, {
        subtree: true,
        attributes: true,
        attributeFilter: ['data-highlighted'],
      })
      return () => observer.disconnect()
    },
    [reduce, top, bottom],
  )

  return (
    <>
      <span ref={followRows} hidden />
      <motion.span
        aria-hidden="true"
        style={{ y: top, height }}
        className={cn(
          'pointer-events-none absolute inset-x-2 top-0 rounded-concentric-2 bg-hover transition-opacity duration-150',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />
    </>
  )
}
