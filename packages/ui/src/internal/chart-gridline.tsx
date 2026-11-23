import { motion } from 'motion/react'

import { duration, ease } from './motion.ts'
import { useChartRowY } from './use-chart-row-y.ts'
import type { ChartAxis } from './use-chart-row-y.ts'

/**
 * A horizontal gridline that rides a moving value axis, after Arc UI's
 * charts (https://uiarc.dev, MIT). Inside an SVG and an `AnimatePresence`:
 * a new row fades in, a row the new range drops fades out.
 *
 * @summary Internal: a chart gridline that rides the value axis.
 */
export function ChartGridline({
  value,
  axis,
  height,
  top,
}: {
  value: number
  axis: ChartAxis
  height: number
  top: number
}) {
  const y = useChartRowY(value, axis, height, top)
  return (
    <motion.line
      x1={0}
      x2="100%"
      y1={y}
      y2={y}
      className="stroke-line [shape-rendering:crispEdges]"
      strokeWidth={1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: duration.instant, ease: ease.standard },
      }}
      transition={{ duration: duration.standard, ease: ease.standard }}
    />
  )
}
