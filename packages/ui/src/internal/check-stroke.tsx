import { motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { duration, ease } from './motion.ts'

/**
 * A tick that draws itself from its short stroke in 200ms, after Arc UI
 * (https://uiarc.dev, MIT). It draws each time it is shown: give it a new
 * `key` to draw it again. Still, it is simply there.
 *
 * @summary Internal: the drawn tick of CopyButton, ExpandingButtonGroup and HoldToConfirm.
 */
export function CheckStroke({
  className,
  delay = 0.06,
  drawFor = duration.standard,
}: {
  className?: string
  /** Seconds before the stroke starts, the time for its box to appear. */
  delay?: number
  /** Seconds the stroke takes to draw: longer for a bigger, slower ending. */
  drawFor?: number
}) {
  const reduce = useReduceMotion()
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('block overflow-visible', className)}
    >
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: {
            duration: drawFor,
            ease: ease.standard,
            delay,
          },
          opacity: { duration: duration.instant, delay },
        }}
      />
    </svg>
  )
}
