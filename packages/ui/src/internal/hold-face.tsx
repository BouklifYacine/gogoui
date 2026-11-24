import type { ReactNode } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { MotionValue, TargetAndTransition } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { CheckStroke } from './check-stroke.tsx'
import { GoGoIcon } from './gogo-icon.tsx'
import { blur, duration, ease, spring } from './motion.ts'

const rest: TargetAndTransition = {
  opacity: 1,
  y: 0,
  scale: 1,
  filter: 'blur(0px)',
}
const textIn: TargetAndTransition = {
  opacity: 0,
  y: '0.3em',
  filter: `blur(${blur.soft}px)`,
}
const textOut: TargetAndTransition = {
  opacity: 0,
  y: '-0.3em',
  filter: `blur(${blur.subtle}px)`,
  transition: { duration: duration.fast, ease: ease.standard },
}
const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: 0.6,
  filter: `blur(${blur.subtle}px)`,
}
const iconOut: TargetAndTransition = {
  ...iconIn,
  transition: { duration: duration.fast, ease: ease.standard },
}
const fadeIn: TargetAndTransition = { opacity: 0 }
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: duration.instant },
}
// The scale rides the spring; opacity and blur tween, so the blur never
// springs below zero.
const iconEnter = {
  ...spring.snappy,
  opacity: { duration: duration.fast, ease: ease.enter },
  filter: { duration: duration.fast, ease: ease.enter },
}

/**
 * HoldToConfirm's icon and words. The button draws it twice: on its face
 * and inside the fill, so the words change colour exactly at the fill's
 * edge. The icon turns into a spinner, then a drawn tick; the words rise
 * out of a blur while the frame's width springs to them.
 *
 * @summary Internal: the face of HoldToConfirm.
 */
export function HoldFace({
  icon,
  stage,
  text,
  width,
  measure,
  mirror = false,
}: {
  icon: ReactNode
  stage: 'idle' | 'busy' | 'done'
  text: string
  width: MotionValue<number | 'auto'>
  /** Only on the copy that measures the words. */
  measure?: (node: HTMLSpanElement | null) => (() => void) | undefined
  /**
   * The copy inside the fill: its words are drawn with CSS, so the button
   * holds them once and its visible text matches its name (WCAG 2.5.3).
   */
  mirror?: boolean
}) {
  const reduce = useReduceMotion()
  const showIcon = icon !== undefined || stage !== 'idle'

  return (
    <span className="inline-flex items-center whitespace-nowrap">
      <m.span
        aria-hidden="true"
        className="grid shrink-0 justify-start overflow-hidden"
        initial={false}
        animate={{ width: showIcon ? 26 : 0 }}
        transition={reduce ? { duration: 0 } : spring.morph}
      >
        <span className="grid size-4.5 place-items-center">
          <AnimatePresence initial={false}>
            <m.span
              key={stage}
              className="col-start-1 row-start-1 grid place-items-center [&_svg:not([class*='size-'])]:size-4.5"
              initial={reduce ? fadeIn : iconIn}
              animate={rest}
              exit={reduce ? fadeOut : iconOut}
              transition={reduce ? { duration: duration.fast } : iconEnter}
            >
              {stage === 'done' ? (
                <CheckStroke
                  className="size-4.5"
                  delay={0.08}
                  drawFor={duration.considered}
                />
              ) : stage === 'busy' ? (
                <GoGoIcon
                  name="loading"
                  aria-hidden="true"
                  className="size-4.5 animate-spin motion-reduce:[animation-duration:2.4s]"
                />
              ) : (
                icon
              )}
            </m.span>
          </AnimatePresence>
        </span>
      </m.span>
      {/* Clips the leaving words while the frame narrows, with room for
          their rise and their blur. */}
      <m.span
        className="relative inline-flex min-w-0 [clip-path:inset(-0.6em_-3px)]"
        style={{ width }}
      >
        {measure && (
          <span
            ref={measure}
            className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap"
          >
            {text}
          </span>
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={text}
            data-text={mirror ? text : undefined}
            className={cn(
              'block whitespace-nowrap',
              mirror && 'before:content-[attr(data-text)]',
            )}
            initial={reduce ? fadeIn : textIn}
            animate={rest}
            exit={reduce ? fadeOut : textOut}
            transition={{
              duration: reduce ? duration.fast : duration.standard,
              ease: ease.enter,
            }}
          >
            {mirror ? null : text}
          </m.span>
        </AnimatePresence>
      </m.span>
    </span>
  )
}
