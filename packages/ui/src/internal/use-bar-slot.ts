import { useCallback } from 'react'
import { animate, useMotionValue } from 'motion/react'
import type { MotionValue } from 'motion/react'

import { chartMorph } from './chart-motion.ts'

/** A bar chart's x axis as it zooms: the plot's width and one slot's share of it. */
export type BarFrame = { width: MotionValue<number>; unit: MotionValue<number> }

/**
 * The middle of a slot, in px. Slots count back from the latest bar, so
 * the newest stays pinned right while a longer range zooms out leftward.
 */
export const barCenter = ({ width, unit }: BarFrame, place: number) =>
  width.get() - (place + 0.5) * width.get() * unit.get()

/**
 * A bar's slot that springs to its new place when the range changes,
 * after Arc UI's bar chart (https://uiarc.dev, MIT). Give `attach` to an
 * element that lives as long as the bar: it runs after React draws.
 */
export function useBarSlot(place: number, reduce: boolean) {
  const slot = useMotionValue(place)
  const attach = useCallback(
    (node: Element | null) => {
      if (!node || slot.get() === place) {
        return undefined
      }
      if (reduce) {
        slot.jump(place)
        return undefined
      }
      const controls = animate(slot, place, chartMorph)
      return () => controls.stop()
    },
    [place, reduce, slot],
  )
  return { slot, attach }
}
