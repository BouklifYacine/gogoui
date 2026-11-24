import { useContext, useState } from 'react'
import type { HTMLAttributes, Ref } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { MotionScope } from './motion-scope.tsx'
import { blur, duration, ease } from './motion.ts'
import { SelectSharedContext, indexOfValue } from './select-context.ts'

// The value rolls the way the list runs: a later option rises from below,
// an earlier one drops from above (Arc UI, https://uiarc.dev, MIT).
const roll: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: `${direction * 0.35}em`,
    filter: `blur(${blur.soft}px)`,
  }),
  center: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.standard, ease: ease.enter },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${direction * -0.3}em`,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.fast, ease: ease.standard },
  }),
}

// Reduced motion: a short crossfade, resting where the roll rests.
const fade: Variants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.instant },
  },
  exit: { opacity: 0, transition: { duration: duration.instant } },
}

type SelectRollingValueProps = HTMLAttributes<HTMLSpanElement> & {
  ref?: Ref<HTMLSpanElement>
  /** The chosen value, compared to the last one to know the way to roll. */
  value: unknown
  /** True while the words are the placeholder. */
  isPlaceholder: boolean
}

/**
 * A Select trigger's words, after Arc UI (https://uiarc.dev, MIT): a new
 * value rolls in the way the list runs while the old one leaves the other
 * way. A screen reader reads the real words, once; the moving copies are
 * hidden from it.
 *
 * @summary Internal: the rolling value of SelectValue.
 */
export function SelectRollingValue({
  value,
  isPlaceholder,
  className,
  children,
  ...props
}: SelectRollingValueProps) {
  const shared = useContext(SelectSharedContext)
  const reduce = useReduceMotion()
  const [shown, setShown] = useState({ value, key: 0, direction: 1 })
  if (!Object.is(shown.value, value)) {
    const from = indexOfValue(shared, shown.value)
    const to = indexOfValue(shared, value)
    setShown({
      value,
      key: shown.key + 1,
      direction: from < 0 || to < 0 ? 1 : Math.sign(to - from) || 1,
    })
  }

  return (
    <span
      {...props}
      className={cn(
        'relative grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] text-left',
        className,
      )}
    >
      <span className="sr-only">{children}</span>
      <MotionScope>
        <AnimatePresence initial={false} custom={shown.direction}>
          <m.span
            key={shown.key}
            aria-hidden="true"
            data-placeholder={isPlaceholder || undefined}
            custom={shown.direction}
            variants={reduce ? fade : roll}
            initial="enter"
            animate="center"
            exit="exit"
            className="col-start-1 row-start-1 block truncate data-placeholder:text-fg-subtle"
          >
            {children}
          </m.span>
        </AnimatePresence>
      </MotionScope>
    </span>
  )
}
