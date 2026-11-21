import { AnimatePresence, motion } from 'motion/react'

import { cn } from '../lib/cn.ts'

const rollIn = { type: 'spring', stiffness: 360, damping: 30 } as const

type RollingLineProps = {
  text: string
  /** Two lines of height instead of one. */
  twoLines?: boolean
  className?: string
}

/**
 * A line of text that rolls to its new words.
 *
 * **Use it for** a figure or a status that changes in place (« 3 nouvelles
 * demandes »).
 *
 * **Key props**: `text`, `twoLines` (room for two lines).
 *
 * **Accessibility**: still with reduced motion; the new words are read.
 *
 * @summary A line of text that rolls to its new words.
 */
function RollingLine({ text, twoLines = false, className }: RollingLineProps) {
  return (
    <span
      data-slot="rolling-line"
      className={cn(
        'relative block overflow-hidden',
        twoLines ? 'h-10' : 'h-6',
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={text}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={rollIn}
          className={cn(
            'absolute inset-x-0 top-0',
            twoLines ? 'line-clamp-2' : 'truncate',
          )}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export { RollingLine }
export type { RollingLineProps }
