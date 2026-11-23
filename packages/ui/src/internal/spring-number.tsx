import { useCallback, useRef } from 'react'
import { animate } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { thumbSpring } from './color-picker-context.ts'

/**
 * A number that counts to its new value on a quick spring, after Arc UI's
 * contrast readout (https://uiarc.dev, MIT). Drawn only: give the value in
 * words beside it for screen readers.
 *
 * @summary Internal: a number that counts to its new value.
 */
export function SpringNumber({
  value,
  digits = 2,
  className,
}: {
  value: number
  digits?: number
  className?: string
}) {
  const reduce = useReduceMotion()
  const shown = useRef<number | null>(null)
  // A callback ref, run again for each new value: it counts from the
  // number on screen, and stops when the next value arrives.
  const count = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) {
        return undefined
      }
      const write = (number: number) => {
        shown.current = number
        node.textContent = number.toFixed(digits)
      }
      if (reduce || shown.current === null) {
        write(value)
        return undefined
      }
      write(shown.current)
      const controls = animate(shown.current, value, {
        ...thumbSpring,
        onUpdate: write,
      })
      return () => controls.stop()
    },
    [value, digits, reduce],
  )
  return <span ref={count} aria-hidden="true" className={className} />
}
