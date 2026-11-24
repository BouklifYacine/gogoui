import { AnimatePresence, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { blur, duration, ease } from './motion.ts'

// The new words rise from the side the reading moved toward (a larger
// value or a later day from below), the old ones leave the other way,
// quicker.
const rise: Variants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: `${0.3 * direction}em`,
    filter: `blur(${blur.soft}px)`,
  }),
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.standard, ease: ease.enter },
  },
  gone: (direction: number) => ({
    opacity: 0,
    y: `${-0.3 * direction}em`,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.instant, ease: ease.standard },
  }),
}

const fade: Variants = {
  hidden: { opacity: 0, y: 0, filter: 'blur(0px)' },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.fast },
  },
  gone: { opacity: 0, transition: { duration: 0 } },
}

/**
 * A chart's line of words that swaps in place, after Arc UI's charts
 * (https://uiarc.dev, MIT): the old words pop out of the flow while the
 * new ones rise from `direction` (1 from below, -1 from above), so the
 * line never holds both. A fade only under reduced motion. Inside a
 * `MotionScope`.
 *
 * @summary Internal: a chart's words that swap in the way the reading moved.
 */
export function ChartSwap({
  text,
  direction = 1,
  className,
}: {
  text: string
  direction?: number
  className?: string
}) {
  const reduce = useReduceMotion()
  return (
    <span className={cn('relative block min-w-0', className)}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <m.span
          key={text}
          custom={direction}
          variants={reduce ? fade : rise}
          initial="hidden"
          animate="shown"
          exit="gone"
          className="block truncate"
        >
          {text || ' '}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
