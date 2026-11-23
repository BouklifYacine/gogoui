import { AnimatePresence, motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { spring } from './motion.ts'

/**
 * A slope chart's rank change, after Arc UI (https://uiarc.dev, MIT): an
 * arrow up or down and the places gained or lost, or « = » when the rank
 * holds. The number rolls the way the item moved. Drawn only: the chart
 * says the rank in words.
 *
 * @summary Internal: a slope chart's rank change.
 */
export function SlopeRank({ move }: { move: number }) {
  const reduce = useReduceMotion()
  const text = move === 0 ? '=' : `${Math.abs(move)}`
  const rise = move >= 0 ? 6 : -6
  return (
    <span
      aria-hidden="true"
      data-move={move > 0 ? 'up' : move < 0 ? 'down' : 'level'}
      className="inline-flex min-w-7.5 items-center gap-0.5 text-xs text-fg-subtle tabular-nums data-[move=up]:text-fg-muted"
    >
      {move !== 0 && (
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path
            d={
              move > 0
                ? 'M4 7V1M1.5 3.5 4 1l2.5 2.5'
                : 'M4 1v6M1.5 4.5 4 7l2.5-2.5'
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={{ opacity: 0, y: reduce ? 0 : rise }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -rise }}
            transition={reduce ? { duration: 0 } : spring.snappy}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
