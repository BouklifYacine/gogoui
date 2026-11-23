import { motion, useTransform } from 'motion/react'

import { duration, ease } from './motion.ts'
import { barCenter, useBarSlot } from './use-bar-slot.ts'
import type { BarFrame } from './use-bar-slot.ts'

/**
 * A label under a BarChart's bar, after Arc UI's bar chart
 * (https://uiarc.dev, MIT): centred under its bar and carried by the
 * zoom. `shift` is the nudge that keeps a label at either end inside the
 * plot. Inside an `AnimatePresence`: it fades in and out.
 *
 * @summary Internal: a bar chart's axis label that follows its bar.
 */
export function BarChartAxisLabel({
  text,
  size,
  shift,
  place,
  frame,
  reduce,
}: {
  text: string
  /** The label's width, in px. */
  size: number
  shift: number
  place: number
  frame: BarFrame
  reduce: boolean
}) {
  const { slot, attach } = useBarSlot(place, reduce)
  const x = useTransform(() => barCenter(frame, slot.get()) - size / 2 + shift)
  return (
    <motion.span
      style={{ x }}
      className="absolute top-2 left-0 text-xs/none whitespace-nowrap text-fg-subtle tabular-nums"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: duration.instant, ease: ease.standard },
      }}
      transition={{ duration: duration.standard, ease: ease.standard }}
    >
      {/* A plain element carries the slot's spring: motion's own elements never re-run a changed ref. */}
      <span ref={attach}>{text}</span>
    </motion.span>
  )
}
