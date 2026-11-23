import { useRef } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import type { MotionValue } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { chartFollow } from './chart-motion.ts'

/**
 * A position (a crosshair's x, a tooltip's corner) that glides from one
 * reading to the next, after Arc UI's charts (https://uiarc.dev, MIT). It
 * lands at once when it appears, for a keyboard step given `instant`, and
 * always under reduced motion.
 *
 * Give the returned value to a `motion` style, and call `moveTo` from a
 * callback ref (it runs after React draws), with null once the reading
 * leaves.
 */
export function useChartGlide(): {
  value: MotionValue<number>
  moveTo: (to: number | null, instant?: boolean) => void
} {
  const reduce = useReduceMotion()
  const target = useMotionValue(0)
  const glide = useSpring(target, {
    stiffness: chartFollow.stiffness,
    damping: chartFollow.damping,
    restDelta: chartFollow.restDelta,
  })
  const shown = useRef(false)
  const moveTo = (to: number | null, instant = false) => {
    if (to === null) {
      shown.current = false
      return
    }
    target.set(to)
    if (!shown.current || instant || reduce) {
      glide.jump(to)
    }
    shown.current = true
  }
  return { value: reduce ? target : glide, moveTo }
}
