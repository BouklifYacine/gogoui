import { useCallback, useRef } from 'react'
import { animate } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { spring } from './motion.ts'

/**
 * A share in percent that counts to its new value, written the language's
 * way (« 12,5 % »), after Arc UI's waffle chart (https://uiarc.dev, MIT).
 * Drawn only: its caller gives the share in words to screen readers.
 *
 * @summary Internal: a percentage that counts to its new value.
 */
export function RollingShare({
  value,
  locale,
  decimals = 0,
  className,
}: {
  /** The share, in percent points (12.5 for 12,5 %). */
  value: number
  /** The language's code for numbers (Intl). */
  locale: string
  decimals?: number
  className?: string
}) {
  const reduce = useReduceMotion()
  const shown = useRef<number | null>(null)
  // A callback ref, run again for each new value: it counts from the
  // share on screen, and stops when the next value arrives.
  const count = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) {
        return undefined
      }
      const words = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      const write = (share: number) => {
        shown.current = share
        node.textContent = words.format(share / 100)
      }
      if (reduce || shown.current === null) {
        write(value)
        return undefined
      }
      const controls = animate(shown.current, value, {
        ...spring.smooth,
        onUpdate: write,
      })
      return () => controls.stop()
    },
    [value, locale, decimals, reduce],
  )
  return <span ref={count} aria-hidden="true" className={className} />
}
