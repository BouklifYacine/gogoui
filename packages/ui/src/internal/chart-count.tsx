import { useCallback, useRef } from 'react'
import { animate } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { physicalSpring } from './chart-motion.ts'

/**
 * A chart's figure that counts to each new value, after Arc UI's donut
 * chart (https://uiarc.dev, MIT): written straight into the page, so no
 * frame draws React again. A whole target counts in whole steps. Give it a
 * stable `format` (from `useMemo`): a new one restarts the count. Drawn
 * only: say the value in words elsewhere for screen readers.
 *
 * @summary Internal: a chart's figure that counts to its new value.
 */
export function ChartCount({
  value,
  format,
  className,
}: {
  value: number
  format: (value: number) => string
  className?: string
}) {
  const reduce = useReduceMotion()
  const shown = useRef<number | null>(null)
  // A callback ref, run again for each new value: it counts from the
  // number on screen and stops when the next value arrives.
  const count = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) {
        return undefined
      }
      const whole = Number.isInteger(value)
      const write = (now: number) => {
        shown.current = now
        node.textContent = format(whole ? Math.round(now) : now)
      }
      const from = shown.current
      if (reduce || from === null || from === value) {
        write(value)
        return undefined
      }
      const controls = animate(from, value, {
        ...physicalSpring(0.4, Math.max(Math.abs(value - from) * 0.001, 1e-6)),
        onUpdate: write,
        onComplete: () => write(value),
      })
      return () => controls.stop()
    },
    [format, reduce, value],
  )
  return <span ref={count} aria-hidden="true" className={className} />
}
