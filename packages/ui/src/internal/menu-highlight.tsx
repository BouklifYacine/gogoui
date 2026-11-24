import { useCallback, useState } from 'react'
import { animate, m, useMotionValue, useTransform } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { MotionFeatures } from './motion-features.tsx'
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
 * Under the pointer the fill stays light; moved by the keys it also draws
 * the focus outline's colour as a 2px ring, so the row reads at 3:1
 * against the menu (WCAG 2.4.7, 1.4.11).
 *
 * @summary Internal: the gliding highlight of DropdownMenu and ContextMenu.
 */
export function MenuHighlight() {
  const reduce = useReduceMotion()
  const top = useMotionValue(0)
  const height = useMotionValue(0)
  const opacity = useTransform(height, (h) => (h > 0 ? 1 : 0))
  const [danger, setDanger] = useState(false)
  const [byKeys, setByKeys] = useState(false)

  // Watches the rows from a plain marker beside the highlight: it starts
  // when the menu opens, stops when it closes.
  const followRows = useCallback(
    (marker: HTMLSpanElement | null) => {
      const popup = marker?.parentElement
      if (!popup) {
        return undefined
      }
      const page = popup.ownerDocument
      let at: HTMLElement | null = null
      // Opened from the keyboard, the trigger (or a combobox's input) has
      // the keyboard's focus as the menu appears.
      let keyboard = page.activeElement?.matches(':focus-visible') ?? false
      // Keys are heard on the whole page: a combobox or a select keeps the
      // focus in its input while the arrows move the highlight.
      const onKey = () => {
        keyboard = true
      }
      const onPointer = () => {
        keyboard = false
        setByKeys(false)
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
        // Not the row's :focus-visible: once the keys have opened the menu,
        // Chrome keeps it on rows the pointer focuses afterwards.
        setByKeys(keyboard)
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
      page.addEventListener('keydown', onKey, true)
      popup.addEventListener('pointermove', onPointer)
      return () => {
        observer.disconnect()
        page.removeEventListener('keydown', onKey, true)
        popup.removeEventListener('pointermove', onPointer)
      }
    },
    [reduce, top, height],
  )

  return (
    <MotionFeatures>
      <span ref={followRows} hidden />
      <m.span
        aria-hidden="true"
        data-slot="menu-highlight"
        data-keyboard={byKeys || undefined}
        style={{ y: top, height, opacity }}
        className={cn(
          'pointer-events-none absolute inset-x-1.5 top-0 rounded-concentric-1.5 transition-[background-color,opacity] duration-100 ease-standard',
          danger ? 'bg-danger-subtle' : 'bg-menu-highlight',
          byKeys && 'ring-2 ring-focus ring-inset',
        )}
      />
    </MotionFeatures>
  )
}
