import { m, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'

import { clamp } from './chart-scale.ts'
import { duration, ease } from './motion.ts'
import { useChartRowY } from './use-chart-row-y.ts'
import type { ChartAxis } from './use-chart-row-y.ts'

/**
 * A value axis label that rides the axis beside its gridline, after Arc
 * UI's charts (https://uiarc.dev, MIT). Inside the chart's gutter and an
 * `AnimatePresence`. `avoid` is another label's y (an average): this one
 * makes way when they would overlap.
 *
 * @summary Internal: a chart's value label that rides the value axis.
 */
export function ChartTick({
  value,
  text,
  axis,
  height,
  top,
  avoid,
}: {
  value: number
  text: string
  axis: ChartAxis
  height: number
  top: number
  avoid?: MotionValue<number> | null
}) {
  const y = useChartRowY(value, axis, height, top)
  const opacity = useTransform(() =>
    avoid ? clamp((Math.abs(y.get() - avoid.get()) - 10) / 6, 0, 1) : 1,
  )
  return (
    <m.span
      style={{ y }}
      className="pointer-events-none absolute top-0 left-2.5 block h-0 whitespace-nowrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: duration.instant, ease: ease.standard },
      }}
      transition={{ duration: duration.standard, ease: ease.standard }}
    >
      <m.span
        style={{ opacity }}
        className="block -translate-y-1/2 text-xs/none text-fg-subtle tabular-nums"
      >
        {text}
      </m.span>
    </m.span>
  )
}
