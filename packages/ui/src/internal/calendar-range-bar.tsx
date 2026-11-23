import { motion } from 'motion/react'

import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { duration, spring } from './motion.ts'

// A range's tint, under the days between its two ends.
const tint: Record<Color, string> = {
  neutral: 'bg-neutral-subtle',
  primary: 'bg-primary-subtle',
  info: 'bg-info-subtle',
  success: 'bg-success-subtle',
  warning: 'bg-warning-subtle',
  danger: 'bg-danger-subtle',
}

/**
 * One week's slice of a range, after Arc UI (https://uiarc.dev, MIT): a
 * pill whose start and width follow a spring. It grows out of the edge
 * the range comes from, so a range that follows the pointer stretches.
 *
 * @summary Internal: a week's bar in Calendar's range.
 */
export function CalendarRangeBar({
  row,
  left,
  width,
  color,
  instant,
}: {
  row: number
  left: number
  width: number
  color: Color
  instant: boolean
}) {
  const stretch = instant ? { duration: 0 } : spring.morph
  const at = { left: `${left}%`, width: `${width}%` }
  return (
    <motion.span
      aria-hidden="true"
      className={cn('absolute rounded-full', tint[color])}
      // A row is a seventh of the layer's width tall (cqw: the layer is a
      // size container), 3px in at the top and the bottom.
      style={{
        top: `calc(${row} * 100cqw / 7 + 3px)`,
        height: 'calc(100cqw / 7 - 6px)',
      }}
      initial={{ ...at, opacity: 0 }}
      animate={{ ...at, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: duration.exit } }}
      transition={{
        left: stretch,
        width: stretch,
        opacity: { duration: duration.fast },
      }}
    />
  )
}
