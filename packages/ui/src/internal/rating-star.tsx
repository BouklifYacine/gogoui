import type { Ref } from 'react'
import { motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { GoGoIcon } from './gogo-icon.tsx'
import { spring } from './motion.ts'

const still = { duration: 0 }

// A layer shows the part of the star from the left up to --fill (0 to 1).
const SWEEP =
  '[grid-area:1/1] [clip-path:inset(0_calc((1-var(--fill))*100%)_0_0)]'

const live: Record<Color, string> = {
  neutral: 'text-neutral',
  primary: 'text-primary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

const kept: Record<Color, string> = {
  neutral: 'text-neutral/30',
  primary: 'text-primary/30',
  info: 'text-info/30',
  success: 'text-success/30',
  warning: 'text-warning/30',
  danger: 'text-danger/30',
}

/**
 * One star of a Rating in three layers, after Arc UI (https://uiarc.dev,
 * MIT): the empty star, a faint mark of the chosen value that follows on a
 * smooth spring, and the live fill that sweeps left to right (snappy, one
 * star after the other). A press sinks it to .86; empty stars beside a
 * value soften to .9. The pop of a choice is played on `popRef` by Rating.
 *
 * @summary Internal: one animated star of Rating.
 */
export function RatingStar({
  fill,
  value,
  delay,
  rated,
  pressed,
  color,
  popRef,
}: {
  /** What the star shows now, preview included (0 to 1). */
  fill: number
  /** What the chosen value fills of it (0 to 1). */
  value: number
  /** The wait before its sweep, in seconds. */
  delay: number
  /** A value shows: empty stars turn into a quiet solid. */
  rated: boolean
  pressed: boolean
  color: Color
  popRef: Ref<HTMLSpanElement>
}) {
  const reduce = useReduceMotion()
  const soft = rated && fill === 0
  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={{ scale: pressed && !reduce ? 0.86 : soft ? 0.9 : 1 }}
      transition={reduce ? still : spring.snappy}
      className="pointer-events-none grid size-(--glyph)"
    >
      <span ref={popRef} className="grid size-full">
        <GoGoIcon
          name="star"
          weight={rated ? 'fill' : 'regular'}
          className={cn(
            'size-full transition-colors duration-200 ease-standard [grid-area:1/1]',
            rated ? 'text-line' : 'text-fg-subtle',
          )}
        />
        <motion.span
          initial={false}
          animate={{ '--fill': value }}
          transition={reduce ? still : spring.smooth}
          className={cn(SWEEP, kept[color])}
        >
          <GoGoIcon name="star" weight="fill" className="size-full" />
        </motion.span>
        <motion.span
          initial={false}
          animate={{ '--fill': fill }}
          transition={reduce ? still : { ...spring.snappy, delay }}
          className={cn(SWEEP, live[color])}
        >
          <GoGoIcon name="star" weight="fill" className="size-full" />
        </motion.span>
      </span>
    </motion.span>
  )
}
