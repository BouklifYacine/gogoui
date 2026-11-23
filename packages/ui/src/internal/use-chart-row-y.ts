import { useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'

/** The value axis of a chart as it moves: its lowest and highest values. */
export type ChartAxis = { min: MotionValue<number>; max: MotionValue<number> }

/**
 * The y, in px, of a value on a moving value axis, after Arc UI's charts
 * (https://uiarc.dev, MIT): a gridline or a tick label rides the axis, so
 * a taller range slides it down instead of jumping. `top` is the room
 * kept above the highest gridline. Rounded to the half pixel, so a 1px
 * line stays crisp.
 */
export function useChartRowY(
  value: number,
  axis: ChartAxis,
  height: number,
  top: number,
): MotionValue<number> {
  return useTransform(() => {
    const low = axis.min.get()
    const span = axis.max.get() - low || 1
    return Math.round(top + (1 - (value - low) / span) * (height - top)) + 0.5
  })
}
