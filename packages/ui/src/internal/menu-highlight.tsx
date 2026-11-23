import { useCallback, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { spring } from './motion.ts'

// The rows a menu can highlight: items, checkbox and radio items, and the
// row that opens a sub-menu.
const ROW =
  "[data-highlighted]:is([data-slot$='-item'], [data-slot$='-sub-trigger'])"

/**
 * One highlight for a whole menu, after Arc UI (https://uiarc.dev, MIT): it
 * glides from row to row under the pointer, and jumps with the arrow keys,
 * where a glide would only lag behind. It reads Base UI's own
 * data-highlighted, and turns red under a destructive item.
 *
 * @summary Internal: the gliding highlight of DropdownMenu and ContextMenu.
 */
export function MenuHighlight() {
  const reduce = useReduceMotion()
  const top = useMotionValue(0)
  const height = useMotionValue(0)
  const opacity = useTransform(height, (h) => (h > 0 ? 1 : 0))
  const [danger, setDanger] = useState(false)

  // Watches the rows from a plain marker beside the highlight: it starts
  // when the menu opens, stops when it closes.
  const followRows = useCallback(
    (marker: HTMLSpanElement | null) => {
      const popup = marker?.parentElement
      if (!popup) {
        return undefined
      }
      let at: HTMLElement | null = null
      let keyboard = false
      const onKey = () => {
        keyboard = true
      }
      const onPointer = () => {
        keyboard = false
      }
      const follow = () => {
        const row = popup.querySelector<HTMLElement>(ROW)
        if (!row) {
          // Over a separator or out of the menu: the highlight lingers a
          // moment, so crossing a separator does not blink.
          const left = at
          window.setTimeout(() => {
            if (at === left && !popup.querySelector(ROW)) {
              height.jump(0)
              at = null
            }
          }, 70)
          return
        }
        if (row === at) {
          return
        }
        setDanger(row.dataset.variant === 'destructive')
        if (!at || reduce || keyboard) {
          top.jump(row.offsetTop)
          height.jump(row.offsetHeight)
        } else {
          animate(top, row.offsetTop, spring.morph)
          animate(height, row.offsetHeight, spring.morph)
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
      popup.addEventListener('keydown', onKey)
      popup.addEventListener('pointermove', onPointer)
      return () => {
        observer.disconnect()
        popup.removeEventListener('keydown', onKey)
        popup.removeEventListener('pointermove', onPointer)
      }
    },
    [reduce, top, height],
  )

  return (
    <>
      <span ref={followRows} hidden />
      <motion.span
        aria-hidden="true"
        data-slot="menu-highlight"
        style={{ y: top, height, opacity }}
        className={cn(
          'pointer-events-none absolute inset-x-1.5 top-0 rounded-concentric-1.5 transition-[background-color,opacity] duration-100 ease-standard',
          danger ? 'bg-danger-subtle' : 'bg-menu-highlight',
        )}
      />
    </>
  )
}
