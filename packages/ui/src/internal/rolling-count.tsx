import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { blur, spring } from './motion.ts'

// A number rises when it grows and falls when it shrinks; the old one
// leaves the other way, slightly blurred.
const roll: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: `${direction * 55}%`,
    filter: `blur(${blur.subtle}px)`,
  }),
  center: { opacity: 1, y: '0%', filter: 'blur(0px)' },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${direction * -55}%`,
    filter: `blur(${blur.subtle}px)`,
  }),
}

/**
 * A whole number that rolls to its new value, after Arc UI's changelog
 * (https://uiarc.dev, MIT): up when it grows, down when it shrinks. Still
 * under reduced motion. Its caller says the count in words for a screen
 * reader and hides this one.
 *
 * @summary Internal: a number that rolls up or down to its new value.
 */
export function RollingCount({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const reduce = useReduceMotion()
  // The direction is set when the value changes, during the render.
  const [last, setLast] = useState({ value, direction: 1 })
  if (last.value !== value) {
    setLast({ value, direction: value > last.value ? 1 : -1 })
  }
  return (
    <span
      className={cn(
        'relative inline-flex overflow-hidden tabular-nums',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={last.direction}>
        <m.span
          key={value}
          className="inline-block"
          custom={last.direction}
          variants={roll}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reduce ? { duration: 0 } : spring.snappy}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
