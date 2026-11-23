import { useCallback, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { TargetAndTransition, Transition } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MorphText } from '../internal/morph-text.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useMorphWidth } from '../internal/use-morph-width.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { Spinner } from './spinner.tsx'

/** One state of an ActionSwap: « Suivre », « Suivi »… */
type ActionSwapState = {
  value: string
  label: string
  icon?: ReactNode
  /**
   * `success`, `warning` (and `danger`) tint the button to confirm a
   * result; `neutral`, `primary`, `info` paint it as Button's `color`.
   */
  color?: Color
  /** Shown while `onAction` runs on the way into this state (« Envoi… »); without it, the pill folds into a turning circle. */
  pendingLabel?: string
  /** Moves on by itself after this many ms (a brief « Envoyé »). */
  holdFor?: number
}

type ActionSwapProps = {
  /** The states, in order; a press moves to the next, the last back to the first. */
  states: ActionSwapState[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, state: ActionSwapState) => void
  /**
   * Runs on a press before the button moves on. A promise shows the
   * working phase; a rejection shows `failedLabel`, then the state before.
   */
  onAction?: (
    next: ActionSwapState,
    current: ActionSwapState,
  ) => void | PromiseLike<unknown>
  /** Shown after a failure, « Réessayer » by default. */
  failedLabel?: string
  /** `default`: filled. `outline`: the white button. */
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  className?: string
}

// How long a failure stays before the button reads as before.
const FAILED_MS = 1800
// A quick answer still shows its working shape this long: a step, not a flash.
const MIN_WORKING_MS = 450

// A circle once folded: as wide as high.
const sizes = {
  sm: { size: 'sm', pad: '1rem', circle: 'min-w-8 max-md:min-w-11' },
  default: { size: 'default', pad: '1rem', circle: 'min-w-9 max-md:min-w-11' },
  lg: { size: 'lg', pad: '1.25rem', circle: 'min-w-11' },
} as const

const rest: TargetAndTransition = { opacity: 1, scale: 1, filter: 'blur(0px)' }
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 }
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: duration.instant },
}
const tween = { duration: duration.standard, ease: ease.enter } as const
const leave = { duration: duration.fast, ease: ease.standard } as const
// Icons trade places through a blur: the old one shrinks away, the new one
// grows on the spring.
const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: 0.7,
  filter: `blur(${blur.soft}px)`,
}
const iconOut: TargetAndTransition = { ...iconIn, transition: leave }
const iconEnter: Transition = {
  scale: spring.snappy,
  opacity: tween,
  filter: tween,
}
// Success: its icon is wiped in from the leading edge while it grows.
const successIn: TargetAndTransition = {
  ...iconIn,
  clipPath: 'inset(0% 100% 0% 0%)',
}
const successRest: TargetAndTransition = {
  ...rest,
  clipPath: 'inset(0% 0% 0% 0%)',
}
const successEnter: Transition = {
  scale: spring.smooth,
  opacity: tween,
  filter: tween,
  clipPath: { duration: duration.considered, ease: ease.standard, delay: 0.02 },
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'working'; target: ActionSwapState }
  | { kind: 'failed' }
const IDLE: Phase = { kind: 'idle' }

// Tints that confirm a result; the other colours paint the shape.
const confirming = (color?: Color) =>
  color === 'success' || color === 'warning' || color === 'danger'

/**
 * A button that moves through a few states of one action, after Arc UI
 * (https://uiarc.dev, MIT): « Suivre » → « Suivi », « Envoyer » → « Envoi… »
 * → « Envoyé ».
 *
 * **Use it for** an action whose result shows on the button itself:
 * follow, send, invite again, mark as paid. **Not for** a form's submit
 * (`SubmitButton`), nor an on/off setting (`Switch`).
 *
 * **Where**: where its Button would be: a card, a row, a header.
 *
 * **States**: each state's words, icon and colour; working (`pendingLabel`,
 * or folded into a turning circle, 450 ms at least); failed (red tint,
 * « Réessayer », 1.8 s); a state with `holdFor` moves on by itself.
 * Words morph letter by letter, the width follows on a spring, a success
 * icon is wiped in. Everything can be interrupted.
 *
 * **Key props**: `states` (`value`, `label`, `icon`, `color`,
 * `pendingLabel`, `holdFor`), `value` / `defaultValue` /
 * `onValueChange`, `onAction` (a promise for the working phase),
 * `failedLabel`, `variant` (default, outline), `size` (sm, default, lg).
 *
 * **Accessibility**: named by its current words; each new state, the
 * working phase and a failure are read once by a live region. While
 * working it keeps the focus and says `aria-busy`.
 *
 * @summary A button that moves through the states of one action.
 */
function ActionSwap({
  states,
  value,
  defaultValue,
  onValueChange,
  onAction,
  failedLabel,
  variant = 'default',
  size = 'default',
  disabled,
  className,
}: ActionSwapProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const [ownValue, setOwnValue] = useState(defaultValue ?? states[0]?.value)
  const [phase, setPhase] = useState<Phase>(IDLE)
  const [spoken, setSpoken] = useState('')
  // Each press is a run; a later one (or leaving) makes an older one stale.
  const run = useRef(0)
  const failedWord = failedLabel ?? messages.tryAgain

  const activeValue = value ?? ownValue
  const activeIndex = Math.max(
    0,
    states.findIndex((state) => state.value === activeValue),
  )
  const active = states[activeIndex] ?? states[0]
  const next = states[(activeIndex + 1) % states.length] ?? active
  const inactive = disabled || states.length < 2
  const working = phase.kind === 'working'
  const folded = working && !phase.target.pendingLabel

  function commit(target: ActionSwapState) {
    setPhase(IDLE)
    if (value === undefined) setOwnValue(target.value)
    setSpoken(target.label)
    onValueChange?.(target.value, target)
  }

  function fail() {
    setPhase({ kind: 'failed' })
    setSpoken(failedWord)
  }

  function advance() {
    if (!active || !next || inactive || working) {
      return
    }
    const target = next
    const id = ++run.current
    let result: void | PromiseLike<unknown>
    try {
      result = onAction?.(target, active)
    } catch {
      fail()
      return
    }
    if (!result || typeof result.then !== 'function') {
      commit(target)
      return
    }
    setPhase({ kind: 'working', target })
    setSpoken(target.pendingLabel ?? messages.working)
    const started = performance.now()
    const settle = (then: () => void) =>
      window.setTimeout(
        () => {
          if (run.current === id) then()
        },
        Math.max(0, MIN_WORKING_MS - (performance.now() - started)),
      )
    result.then(
      () => settle(() => commit(target)),
      () => settle(fail),
    )
  }

  // Timers as callback refs on a hidden marker: each starts with its state
  // or its failure, and stops when it changes or the button goes.
  const holdFor = phase.kind === 'idle' ? active?.holdFor : undefined
  // Restarts only with a new state, never on a parent's re-render: the
  // timer keeps the state it started in (Arc does the same).
  /* oxlint-disable react-hooks/exhaustive-deps */
  const holdTimer = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || !holdFor || !next) {
        return undefined
      }
      const timer = window.setTimeout(() => commit(next), holdFor)
      return () => window.clearTimeout(timer)
    },
    [holdFor, active?.value],
  )
  /* oxlint-enable react-hooks/exhaustive-deps */
  const failedTimer = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || phase.kind !== 'failed') {
        return undefined
      }
      const timer = window.setTimeout(() => setPhase(IDLE), FAILED_MS)
      return () => window.clearTimeout(timer)
    },
    [phase],
  )
  // Leaving makes any run in flight stale.
  const forgetRuns = useCallback((node: HTMLSpanElement | null) => {
    if (!node) {
      return undefined
    }
    return () => {
      run.current += 1
    }
  }, [])

  // The morphing words: their window springs to them, to nothing when the
  // pill folds; the gap to the icon goes with them.
  const [width, measure] = useMorphWidth(reduce)

  if (!active) {
    return null
  }

  const view =
    phase.kind === 'working'
      ? {
          key: 'working',
          label: phase.target.pendingLabel ?? '',
          icon: <Spinner aria-hidden="true" className="size-4" />,
          color: active.color,
        }
      : phase.kind === 'failed'
        ? {
            key: 'failed',
            label: failedWord,
            icon: (
              <GoGoIcon name="danger" aria-hidden="true" className="size-4" />
            ),
            color: 'danger' as const,
          }
        : {
            key: `state:${active.value}`,
            label: active.label,
            icon: active.icon,
            color: active.color,
          }
  const wipe = view.color === 'success' && !reduce
  const tinted = confirming(view.color)
  const gap = Boolean(view.icon) && view.label.length > 0
  const metric = sizes[size]

  return (
    <MotionScope>
      <Button
        data-slot="action-swap"
        data-phase={phase.kind}
        variant={tinted ? 'subtle' : variant}
        color={view.color}
        size={metric.size}
        disabled={inactive}
        focusableWhenDisabled={working}
        aria-busy={working || undefined}
        onClick={advance}
        className={cn(
          'overflow-clip rounded-full px-0 aria-busy:opacity-100!',
          metric.circle,
          className,
        )}
      >
        {/* The padding eases to nothing as the pill folds round its spinner. */}
        <motion.span
          className="inline-flex items-center justify-center"
          style={
            {
              paddingInline: `calc(${metric.pad} * (1 - var(--fold, 0)))`,
            } as CSSProperties
          }
          initial={false}
          animate={{ '--fold': folded ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : spring.morph}
        >
          <motion.span
            aria-hidden="true"
            className="relative grid h-4 flex-none place-items-center"
            initial={false}
            animate={{ width: view.icon ? 16 : 0 }}
            transition={reduce ? { duration: 0 } : spring.smooth}
          >
            <AnimatePresence initial={false}>
              {view.icon ? (
                <motion.span
                  key={view.key}
                  className="col-start-1 row-start-1 inline-flex items-center justify-center [&_svg]:size-4"
                  initial={reduce ? fadeIn : wipe ? successIn : iconIn}
                  animate={wipe ? successRest : rest}
                  exit={reduce ? fadeOut : iconOut}
                  transition={
                    reduce
                      ? { duration: duration.instant }
                      : wipe
                        ? successEnter
                        : iconEnter
                  }
                >
                  {view.icon}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.span>
          <motion.span
            aria-hidden="true"
            style={{ width }}
            className="inline-flex min-w-0"
          >
            <span
              ref={measure}
              data-morph-key={`${gap ? 1 : 0}${view.label}`}
              className={cn('inline-flex flex-none', gap && 'pl-2')}
            >
              <MorphText text={view.label} />
            </span>
          </motion.span>
        </motion.span>
        <span className="sr-only">{view.label || active.label}</span>
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {spoken}
      </span>
      <span ref={forgetRuns} hidden />
      <span ref={holdTimer} hidden />
      <span ref={failedTimer} hidden />
    </MotionScope>
  )
}

export { ActionSwap }
export type { ActionSwapProps, ActionSwapState }
