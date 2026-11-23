import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { TargetAndTransition, Transition, Variants } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { CheckStroke } from '../internal/check-stroke.tsx'
import type { Color } from '../internal/colors.ts'
import { useExpandingButtonGroup } from '../internal/expanding-button-group-context.ts'
import { blur, duration, ease, spring, stagger } from '../internal/motion.ts'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'

// The label slides out from behind the icon as the width opens, and tucks
// back a little faster than it came.
const labelVariants: Variants = {
  shown: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.standard,
      ease: ease.enter,
      delay: stagger.word,
    },
  },
  hidden: {
    opacity: 0,
    x: -6,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.instant, ease: ease.standard },
  },
}
const stillLabelVariants: Variants = {
  shown: { opacity: 1, transition: { duration: duration.instant } },
  hidden: { opacity: 0, transition: { duration: duration.instant } },
}
const rest: TargetAndTransition = {
  opacity: 1,
  y: 0,
  scale: 1,
  filter: 'blur(0px)',
}
const wordIn: TargetAndTransition = {
  opacity: 0,
  y: '0.5em',
  filter: `blur(${blur.soft}px)`,
}
const wordOut: TargetAndTransition = {
  opacity: 0,
  y: '-0.4em',
  filter: `blur(${blur.subtle}px)`,
  transition: { duration: duration.fast, ease: ease.standard },
}
const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: 0.55,
  filter: `blur(${blur.subtle}px)`,
}
const iconOut: TargetAndTransition = {
  ...iconIn,
  transition: { duration: duration.fast, ease: ease.standard },
}
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 }
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: duration.instant },
}
const instant: Transition = { duration: duration.instant }
// The scale rides the spring; opacity and blur tween, so the blur never
// dips below zero.
const iconEnter: Transition = {
  ...spring.snappy,
  opacity: { duration: duration.fast, ease: ease.enter },
  filter: { duration: duration.fast, ease: ease.enter },
}

// Open, an action takes a tint of its colour; neutral by default.
const open: Record<Color, string> = {
  neutral: 'data-expanded:bg-hover data-expanded:text-fg',
  primary: 'data-expanded:bg-primary-subtle data-expanded:text-primary-active',
  info: 'data-expanded:bg-info-subtle data-expanded:text-info-fg',
  success: 'data-expanded:bg-success-subtle data-expanded:text-success-fg',
  warning: 'data-expanded:bg-warning-subtle data-expanded:text-warning-fg',
  danger: 'data-expanded:bg-danger-subtle data-expanded:text-danger-fg',
}

type ExpandingButtonGroupItemProps = {
  /** Names the action; given to the group's `onAction`. */
  value: string
  /** Shown closed, sized by the group. */
  icon: ReactNode
  /** A short verb (« Archiver »): the label once open, and its name always. */
  children: string
  /** The past tense shown after the action (« Archivé »), with a drawn tick. Leave it out for an action that opens something. */
  doneLabel?: string
  /** Its tint once open: `danger` for a delete. */
  color?: Color
  /** Dim, still focusable, still showing its label, so people learn what it would do. */
  disabled?: boolean
  /**
   * Runs the action. A promise keeps it busy (its icon pulses) until it
   * settles; `false`, or a rejection, skips the confirmation.
   */
  onClick?: () => void | boolean | Promise<void | boolean>
}

/**
 * One action of an `ExpandingButtonGroup`: its icon, and its label when
 * open.
 *
 * @summary One action of an ExpandingButtonGroup.
 */
function ExpandingButtonGroupItem({
  value,
  icon,
  children,
  doneLabel,
  color = 'neutral',
  disabled,
  onClick,
}: ExpandingButtonGroupItemProps) {
  const group = useExpandingButtonGroup()
  const reduce = useReduceMotion()
  // Both words, hidden, in one cell: the slot is as wide as the longer,
  // so the confirmation never changes the width.
  const [words, measureWords] = useElementSize<HTMLSpanElement>()

  const expanded = group.expanded === value
  const done = group.done?.value === value && Boolean(doneLabel)
  const busy = group.busy === value
  const shown = done ? doneLabel! : children

  // Open: inset, icon, gap, words, end. Before the words are measured (the
  // server's page) an open action takes its own width, the same one.
  const { height, icon: iconSize, start, gap, end } = group.geometry
  const width = expanded
    ? words
      ? start + iconSize + gap + words.width + end
      : 'auto'
    : height

  return (
    <motion.button
      type="button"
      data-slot="expanding-button-group-item"
      data-value={value}
      data-expanded={expanded ? '' : undefined}
      data-done={done ? '' : undefined}
      data-unmeasured={words ? undefined : ''}
      aria-label={children}
      aria-disabled={disabled || undefined}
      aria-busy={busy || undefined}
      tabIndex={group.tabStop === value ? 0 : -1}
      initial={false}
      animate={{ width }}
      transition={reduce ? { duration: 0 } : spring.morph}
      onPointerDown={(event) => group.onItemPointerDown(value, event)}
      onClick={() => group.onItemClick({ value, disabled, doneLabel, onClick })}
      onFocus={(event) => group.onItemFocus(value, event)}
      className={cn(
        'group/ebg relative inline-flex h-(--ebg-h) min-w-(--ebg-h) flex-none items-center justify-start gap-(--ebg-gap) overflow-clip rounded-full pl-(--ebg-start) font-medium whitespace-nowrap text-fg-muted outline-none select-none [-webkit-tap-highlight-color:transparent] [touch-action:manipulation]',
        'transition-[color,background-color] duration-200 ease-standard focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus motion-reduce:duration-100',
        group.size === 'sm' ? 'text-xs' : 'text-sm',
        'data-unmeasured:data-expanded:pr-(--ebg-end)',
        open[color],
        // The confirmation: a green tint, unless the action is a red one.
        color !== 'danger' &&
          'data-done:bg-success-subtle data-done:text-success-fg',
        'aria-busy:cursor-progress aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
      )}
    >
      <motion.span
        aria-hidden="true"
        className="relative grid size-(--ebg-icon) flex-none place-items-center transition-[scale] duration-(--motion-spring) ease-spring group-[:active:not([aria-disabled=true])]/ebg:scale-[0.86] group-[:active:not([aria-disabled=true])]/ebg:duration-100 group-[:active:not([aria-disabled=true])]/ebg:ease-standard motion-reduce:scale-100! [&_svg]:size-full"
        initial={false}
        animate={
          busy
            ? reduce
              ? { opacity: 0.6 }
              : { opacity: [1, 0.45, 1] }
            : { opacity: 1 }
        }
        transition={
          busy && !reduce
            ? { duration: 1.1, ease: ease.inOut, repeat: Infinity }
            : instant
        }
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={done ? `done-${group.done?.run}` : 'icon'}
            className="col-start-1 row-start-1 grid size-full place-items-center"
            initial={reduce ? fadeIn : iconIn}
            animate={rest}
            exit={reduce ? fadeOut : iconOut}
            transition={reduce ? instant : iconEnter}
          >
            {done ? <CheckStroke delay={stagger.word} /> : icon}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="inline-grid flex-none items-center justify-items-start"
        variants={reduce ? stillLabelVariants : labelVariants}
        initial={false}
        animate={expanded ? 'shown' : 'hidden'}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={shown}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={reduce ? fadeIn : wordIn}
            animate={rest}
            exit={reduce ? fadeOut : wordOut}
            transition={
              reduce
                ? instant
                : { duration: duration.standard, ease: ease.enter }
            }
          >
            {shown}
          </motion.span>
        </AnimatePresence>
        <span
          ref={measureWords}
          className="pointer-events-none invisible col-start-1 row-start-1 inline-grid"
        >
          <span className="col-start-1 row-start-1">{children}</span>
          {doneLabel && (
            <span className="col-start-1 row-start-1">{doneLabel}</span>
          )}
        </span>
      </motion.span>
    </motion.button>
  )
}

export { ExpandingButtonGroupItem }
export type { ExpandingButtonGroupItemProps }
