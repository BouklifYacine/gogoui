import { AnimatePresence, m } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { swapFade, swapRise } from './swap-variants.ts'

/**
 * Words that swap in place, after Arc UI's billing toggle
 * (https://uiarc.dev, MIT). Every possible text sits in the same grid
 * cell, so the box always has the width of the longest and nothing around
 * it moves when the words change.
 *
 * @summary Internal: words that swap in place in a box of fixed width.
 */
export function StableSwap({
  text,
  candidates,
  className,
}: {
  text: string
  /** Every text it may show, to reserve the room of the longest. */
  candidates: readonly string[]
  className?: string
}) {
  const reduce = useReduceMotion()
  return (
    <span
      className={cn(
        'relative inline-grid justify-items-center overflow-y-clip [overflow-clip-margin:2px]',
        className,
      )}
    >
      {[...new Set(candidates)].map((candidate) => (
        <span
          key={candidate}
          aria-hidden="true"
          className="invisible [grid-area:1/1]"
        >
          {candidate}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <m.span
          key={text}
          variants={reduce ? swapFade : swapRise}
          initial="hidden"
          animate="shown"
          exit="gone"
          className="inline-block [grid-area:1/1]"
        >
          {text}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
