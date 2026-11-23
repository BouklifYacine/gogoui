import { useCallback } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { duration, ease } from './motion.ts'

// Arc's morph spring written as physics (0.3s, no bounce), so a glide
// keeps its speed when a new choice interrupts it.
const ROOT = (2 * Math.PI) / (0.3 * 1.2)
const GLIDE = {
  type: 'spring',
  stiffness: ROOT * ROOT,
  damping: 2 * ROOT,
} as const

const CARD = '[data-slot=field-label]'
const CHOSEN = '[data-slot=radio-group-item][data-checked]'

const edge: Record<Color, string> = {
  neutral: 'border-neutral',
  primary: 'border-primary',
  info: 'border-info',
  success: 'border-success',
  warning: 'border-warning',
  danger: 'border-danger',
}

/**
 * The one ring of RadioCardField, after Arc UI's radio cards
 * (https://uiarc.dev, MIT): it glides from card to card on the chosen
 * one's box, over its edge so the card never changes size. The first
 * choice fades it in; a resize puts it back in place without a glide.
 *
 * It sits inside the radio group (positioned) and reads Base UI's
 * data-checked, so it needs no effect.
 *
 * @summary Internal: the gliding selection ring of RadioCardField.
 */
export function RadioCardRing({
  color = 'primary',
  square = false,
}: {
  color?: Color
  /** Square corners, for the framed list. */
  square?: boolean
}) {
  const reduce = useReduceMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const width = useMotionValue(0)
  const height = useMotionValue(0)
  const opacity = useMotionValue(0)

  // Watches the cards from a plain marker beside the ring: it starts when
  // the group mounts and stops when it goes.
  const followChoice = useCallback(
    (marker: HTMLSpanElement | null) => {
      const group = marker?.parentElement
      if (!group) {
        return undefined
      }
      let placed = false
      const place = (glide: boolean) => {
        const card = group.querySelector(CHOSEN)?.closest<HTMLElement>(CARD)
        if (!card) {
          opacity.jump(0)
          placed = false
          return
        }
        const box = {
          x: card.offsetLeft,
          y: card.offsetTop,
          width: card.offsetWidth,
          height: card.offsetHeight,
        }
        if (!glide || !placed || reduce) {
          x.jump(box.x)
          y.jump(box.y)
          width.jump(box.width)
          height.jump(box.height)
          if (!placed && glide && !reduce) {
            opacity.jump(0)
            animate(opacity, 1, {
              duration: duration.fast,
              ease: ease.standard,
            })
          } else {
            opacity.jump(1)
          }
          placed = true
          return
        }
        animate(x, box.x, GLIDE)
        animate(y, box.y, GLIDE)
        animate(width, box.width, GLIDE)
        animate(height, box.height, GLIDE)
        opacity.jump(1)
      }

      place(false)
      // The cards let the ring draw their chosen edge from now on.
      group.dataset.ringReady = ''
      const choices = new MutationObserver(() => place(true))
      choices.observe(group, {
        subtree: true,
        attributes: true,
        attributeFilter: ['data-checked'],
      })
      const sizes =
        typeof ResizeObserver === 'undefined'
          ? undefined
          : new ResizeObserver(() => place(false))
      sizes?.observe(group)
      return () => {
        choices.disconnect()
        sizes?.disconnect()
        delete group.dataset.ringReady
      }
    },
    [reduce, x, y, width, height, opacity],
  )

  return (
    <>
      <span ref={followChoice} hidden />
      <motion.span
        aria-hidden="true"
        data-slot="radio-card-ring"
        style={{ x, y, width, height, opacity }}
        className={cn(
          'pointer-events-none absolute top-0 left-0 z-1 border-[1.5px]',
          square ? 'rounded-none' : 'rounded-lg',
          edge[color],
        )}
      />
    </>
  )
}
