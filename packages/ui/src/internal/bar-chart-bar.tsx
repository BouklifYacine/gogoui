import { useCallback, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  usePresence,
  useTransform,
} from 'motion/react'
import type { MotionValue } from 'motion/react'

import { cn } from '../lib/cn.ts'
import { chartMorph, physicalSpring } from './chart-motion.ts'
import { duration } from './motion.ts'
import { barCenter, useBarSlot } from './use-bar-slot.ts'
import type { BarFrame } from './use-bar-slot.ts'

/** The share of its slot a bar fills, its widest size, and the radius of its top. */
const FILL = 0.58
const MAX_BAR = 28
const RADIUS = 4
/** A leaving bar sinks faster than a bar grows. */
const collapse = physicalSpring(duration.standard)

/** A column from a square baseline to a softly rounded top. */
function barPath(x: number, w: number, h: number, base: number) {
  const f = (value: number) => value.toFixed(2)
  if (w <= 0 || h <= 0.01) {
    return `M${f(x)} ${base}H${f(x + Math.max(w, 0))}Z`
  }
  const r = Math.min(RADIUS, w / 2, h)
  const top = base - h
  return `M${f(x)} ${base}V${f(top + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(top)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(top + r)}V${base}Z`
}

const tones = {
  rest: 'fill-[color-mix(in_oklab,var(--bar)_62%,var(--surface))] dark:fill-[color-mix(in_oklab,var(--bar)_76%,var(--surface))]',
  dim: 'fill-[color-mix(in_oklab,var(--bar)_24%,var(--surface))] dark:fill-[color-mix(in_oklab,var(--bar)_34%,var(--surface))]',
  active: 'fill-(--bar)',
} as const

/**
 * One column of a BarChart, after Arc UI's bar chart (https://uiarc.dev,
 * MIT). It grows once the chart is seen (after `delay`), settles to each
 * new value, slides to a new slot when the range changes, and sinks into
 * the baseline when it leaves (inside an `AnimatePresence`). Its colour
 * comes from `--bar`.
 *
 * @summary Internal: a bar chart's column that grows, moves and sinks.
 */
export function BarChartBar({
  place,
  value,
  delay,
  shown,
  tone,
  frame,
  scale,
  height,
  top,
  reduce,
}: {
  /** Its slot, counted back from the latest bar (0). */
  place: number
  value: number
  delay: number
  /** The chart has been seen: time to grow. */
  shown: boolean
  tone: keyof typeof tones
  frame: BarFrame
  /** The value at the top gridline. */
  scale: MotionValue<number>
  height: number
  top: number
  reduce: boolean
}) {
  const [isPresent, safeToRemove] = usePresence()
  const amount = useMotionValue(0)
  const { slot, attach } = useBarSlot(place, reduce)
  const [firstDelay] = useState(delay)

  const grow = useCallback(
    (node: SVGGElement | null) => {
      if (!node) {
        return undefined
      }
      if (!isPresent) {
        if (reduce) {
          safeToRemove?.()
          return undefined
        }
        const controls = animate(amount, 0, {
          ...collapse,
          onComplete: () => safeToRemove?.(),
        })
        return () => controls.stop()
      }
      if (reduce) {
        amount.jump(value)
        return undefined
      }
      if (!shown) {
        return undefined
      }
      // The first growth waits its turn; later values settle at once.
      const first = amount.get() === 0 && !amount.isAnimating()
      const controls = animate(
        amount,
        value,
        first ? { ...chartMorph, delay: firstDelay } : chartMorph,
      )
      return () => controls.stop()
    },
    [amount, firstDelay, isPresent, reduce, safeToRemove, shown, value],
  )

  const d = useTransform(() => {
    const w = frame.width.get() * frame.unit.get()
    const size = Math.min(w * FILL, MAX_BAR)
    const center = barCenter(frame, slot.get())
    return barPath(
      center - size / 2,
      size,
      (amount.get() / (scale.get() || 1)) * (height - top),
      height,
    )
  })

  return (
    // Plain groups carry the springs: motion's own elements never re-run a changed ref.
    <g ref={attach}>
      <g ref={grow}>
        <motion.path
          d={d}
          className={cn(
            'transition-[fill] duration-150 ease-standard motion-reduce:transition-none',
            tones[tone],
          )}
        />
      </g>
    </g>
  )
}
