import { AnimatePresence, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { blur, duration, ease } from './motion.ts'
import { MotionScope } from './motion-scope.tsx'

const roll: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: `${direction * 0.45}em`,
    filter: `blur(${blur.subtle}px)`,
  }),
  center: {
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: { duration: duration.standard, ease: ease.enter },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${direction * -0.45}em`,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.fast, ease: ease.standard },
  }),
}

const fade: Variants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: { duration: duration.instant },
  },
  exit: { opacity: 0, transition: { duration: 0.08 } },
}

/**
 * Words that roll one by one, after Arc UI's date range picker
 * (https://uiarc.dev, MIT): a word that changes rolls (up when time moves
 * later, `direction` 1; down when earlier, -1), the words that stay hold
 * still. Hidden from screen readers: give the whole text beside it.
 *
 * @summary Internal: a line whose changed words roll.
 */
export function RollingWords({
  text,
  direction,
  className,
}: {
  text: string
  direction: number
  className?: string
}) {
  const reduce = useReduceMotion()
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex gap-[.28em] whitespace-nowrap', className)}
    >
      <MotionScope>
        {words.map((word, index) => (
          <span key={index} className="relative inline-block">
            <AnimatePresence
              initial={false}
              mode="popLayout"
              custom={direction}
            >
              <m.span
                key={word}
                custom={direction}
                variants={reduce ? fade : roll}
                initial="enter"
                animate="center"
                exit="exit"
                className="inline-block"
              >
                {word}
              </m.span>
            </AnimatePresence>
          </span>
        ))}
      </MotionScope>
    </span>
  )
}
