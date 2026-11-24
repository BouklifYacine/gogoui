import { useContext, useState } from 'react'
import type { HTMLAttributes, Ref } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { MotionScope } from './motion-scope.tsx'
import { blur, duration, ease, spring } from './motion.ts'
import { SelectSharedContext, labelOfValue } from './select-context.ts'

// After Arc UI (https://uiarc.dev, MIT). Each chip sits in a slot whose
// width opens and closes on a spring, so its neighbours travel with it.
const slot: Variants = {
  hidden: { width: 0, opacity: 0 },
  shown: {
    width: 'auto',
    opacity: 1,
    transition: {
      width: spring.smooth,
      opacity: { duration: duration.fast, ease: ease.enter },
    },
  },
  gone: {
    width: 0,
    opacity: 0,
    transition: {
      width: spring.smooth,
      opacity: { duration: duration.instant, ease: ease.standard },
    },
  },
}

// The chip itself grows from .9 out of a soft blur, and shrinks as it goes.
const chip: Variants = {
  hidden: { scale: 0.9, filter: `blur(${blur.soft}px)` },
  shown: {
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...spring.snappy,
      filter: { duration: duration.standard, ease: ease.enter },
    },
  },
  gone: {
    scale: 0.9,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.instant, ease: ease.standard },
  },
}

// The « +N » count rolls: a larger number rises, a smaller one drops.
const roll: Variants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: `${direction * 0.5}em`,
    filter: `blur(${blur.subtle}px)`,
  }),
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.standard, ease: ease.enter },
  },
  gone: (direction: number) => ({
    opacity: 0,
    y: `${direction * -0.5}em`,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.instant, ease: ease.standard },
  }),
}

// Reduced motion: short crossfades, resting where the moving ones rest.
const fade: Variants = {
  hidden: { opacity: 0 },
  shown: {
    opacity: 1,
    width: 'auto',
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.instant },
  },
  gone: { opacity: 0, transition: { duration: duration.instant } },
}
const still: Variants = {
  hidden: { scale: 1, filter: 'blur(0px)' },
  shown: { scale: 1, filter: 'blur(0px)' },
  gone: { scale: 1, filter: 'blur(0px)' },
}

const pill =
  'block max-w-36 shrink-0 truncate rounded-full bg-subtle px-2 py-0.5 text-xs text-fg ring-1 ring-line-subtle ring-inset'

type SelectChipListProps = HTMLAttributes<HTMLSpanElement> & {
  ref?: Ref<HTMLSpanElement>
  values: readonly unknown[]
  /** Chips shown before the rest fold into « +N ». */
  maxVisible: number
  /** True while the words are the placeholder. */
  isPlaceholder: boolean
}

/**
 * The chosen values of a multiple Select, after Arc UI (https://uiarc.dev,
 * MIT): the first few as chips whose slots open and close on a spring, the
 * rest as a « +N » that rolls. A screen reader reads every chosen value,
 * once; the chips are hidden from it.
 *
 * @summary Internal: the chips of SelectChips.
 */
export function SelectChipList({
  values,
  maxVisible,
  isPlaceholder,
  className,
  children,
  ...props
}: SelectChipListProps) {
  const shared = useContext(SelectSharedContext)
  const reduce = useReduceMotion()
  const visible = values.slice(0, Math.max(0, maxVisible))
  const remaining = values.length - visible.length
  const [count, setCount] = useState({ remaining, direction: 1 })
  if (count.remaining !== remaining) {
    setCount({ remaining, direction: remaining > count.remaining ? 1 : -1 })
  }

  return (
    <span
      {...props}
      className={cn(
        'relative flex min-h-6 min-w-0 flex-1 items-center overflow-hidden text-left',
        className,
      )}
    >
      <span className="sr-only">{children}</span>
      <MotionScope>
        <AnimatePresence initial={false}>
          {visible.map((value) => (
            <m.span
              key={`chip-${String(value)}`}
              aria-hidden="true"
              className="flex min-w-0 shrink overflow-hidden"
              variants={reduce ? fade : slot}
              initial="hidden"
              animate="shown"
              exit="gone"
            >
              <m.span
                className={cn(pill, 'mr-1.5')}
                variants={reduce ? still : chip}
              >
                {labelOfValue(shared, value)}
              </m.span>
            </m.span>
          ))}
          {remaining > 0 && (
            <m.span
              key="more"
              aria-hidden="true"
              className="flex shrink-0 overflow-hidden"
              variants={reduce ? fade : slot}
              initial="hidden"
              animate="shown"
              exit="gone"
            >
              <m.span
                className={cn(pill, 'inline-flex text-fg-muted tabular-nums')}
                variants={reduce ? still : chip}
              >
                +
                <span className="inline-grid">
                  <AnimatePresence initial={false} custom={count.direction}>
                    <m.span
                      key={remaining}
                      className="col-start-1 row-start-1"
                      custom={count.direction}
                      variants={reduce ? fade : roll}
                      initial="hidden"
                      animate="shown"
                      exit="gone"
                    >
                      {remaining}
                    </m.span>
                  </AnimatePresence>
                </span>
              </m.span>
            </m.span>
          )}
          {isPlaceholder && (
            <m.span
              key="placeholder"
              aria-hidden="true"
              className="absolute inset-0 flex items-center truncate text-fg-subtle"
              variants={fade}
              initial="hidden"
              animate="shown"
              exit="gone"
            >
              {children}
            </m.span>
          )}
        </AnimatePresence>
      </MotionScope>
    </span>
  )
}
