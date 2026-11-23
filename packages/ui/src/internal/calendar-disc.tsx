import { motion } from 'motion/react'

import { cn } from '../lib/cn.ts'
import type { Cell } from './calendar-state.ts'
import { fill } from './colors.ts'
import type { Color } from './colors.ts'
import { duration, ease, spring } from './motion.ts'

/**
 * The chosen day's disc, one per month, after Arc UI (https://uiarc.dev,
 * MIT). It is placed by week and weekday, not measured, so it glides on a
 * straight line from one day to the next and retargets mid-flight. It
 * grows in when the choice enters the month, fades when it leaves; from
 * the keyboard it lands at once.
 *
 * @summary Internal: Calendar's gliding selection disc.
 */
export function CalendarDisc({
  cell,
  color,
  instant,
  ends = false,
}: {
  cell: Cell
  color: Color
  instant: boolean
  /** A range's end: a little smaller, grows from .8. */
  ends?: boolean
}) {
  const at = { x: `${cell.col * 100}%`, y: `${cell.row * 100}%` }
  const glide = instant ? { duration: 0 } : spring.morph
  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        'absolute top-0 left-0 aspect-square w-[calc(100%/7)]',
        ends ? 'p-[3px]' : 'p-0.5',
      )}
      initial={{ ...at, scale: ends ? 0.8 : 0.7, opacity: 0 }}
      animate={{ ...at, scale: 1, opacity: 1 }}
      exit={{
        scale: ends ? 0.8 : 0.7,
        opacity: 0,
        transition: { duration: duration.fast, ease: ease.standard },
      }}
      transition={{
        x: glide,
        y: glide,
        scale: ends ? glide : spring.snappy,
        opacity: { duration: duration.fast, ease: ease.enter },
      }}
    >
      <span
        className={cn(
          'block size-full rounded-full transition-[scale,filter] duration-(--motion-spring) ease-spring motion-reduce:transition-none',
          // The day under it pressed or pointed at: the disc answers, the
          // day itself never moves.
          !ends &&
            'group-has-[[data-on-disc]:hover]/weeks:brightness-95 group-has-[[data-on-disc]:active]/weeks:scale-94 group-has-[[data-on-disc]:active]/weeks:duration-(--motion-instant)',
          fill[color],
        )}
      />
    </motion.span>
  )
}
