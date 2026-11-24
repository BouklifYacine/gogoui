// Hold to confirm, after Arc UI (https://uiarc.dev, MIT licence, Elia
// Kuratli), on GoGoUI's tokens, colours and words.
import { useCallback, useId, useRef, useState } from 'react'
import type {
  ComponentProps,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from 'react'
import { animate, m, useMotionValue, useTransform } from 'motion/react'
import type { AnimationPlaybackControls } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { text as inkOf } from '../internal/colors.ts'
import { describedBy } from '../internal/field-props.ts'
import type { Color } from '../internal/colors.ts'
import { HoldFace } from '../internal/hold-face.tsx'
import { MotionScope } from '../internal/motion-scope.tsx'
import { duration as durations, spring } from '../internal/motion.ts'
import { useLabelWidth } from '../internal/use-label-width.ts'
import { isVirtualPointer } from '../internal/virtual-pointer.ts'
import { withEllipsis } from '../internal/with-ellipsis.ts'
import { cn } from '../lib/cn.ts'

/** The fill and the words on it, per colour. */
const fillOf: Record<Color, string> = {
  neutral: 'bg-neutral text-neutral-foreground',
  primary: 'bg-primary text-primary-foreground',
  info: 'bg-info text-info-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
}

const sizeOf = {
  sm: 'h-8 rounded-button-sm px-3 text-sm max-md:h-11',
  default: 'h-9 px-4 text-sm max-md:h-11',
  lg: 'h-11 px-5 text-base',
} as const

/** A press this far outside the button lets go, the way a native press does. */
const SLACK = 24

type Phase = 'idle' | 'holding' | 'confirming' | 'done'

/** The words HoldToConfirm writes, to change on one HoldToConfirm only. */
type HoldToConfirmLabels = Partial<Pick<GoGoUIMessages, 'holdHint'>>

type HoldToConfirmProps = Omit<
  ComponentProps<'button'>,
  | 'children'
  | 'color'
  | 'onClick'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onAnimationStart'
  | 'onAnimationEnd'
> & {
  /** The instruction and the act: « Maintenir pour supprimer ». */
  label: string
  /**
   * The name a screen reader reads instead of `label`, when several
   * buttons on one screen share their words: « Retirer la photo 3 ».
   * `aria-label` does the same.
   */
  srLabel?: string
  /** Said once done: « Supprimé ». */
  doneLabel: string
  /** Said while a promise from `onConfirm` runs: « Suppression ». */
  confirmingLabel?: string
  /** Called once the hold completes; a promise keeps the button busy, a refusal rewinds it. */
  onConfirm: () => void | Promise<unknown>
  /** How long to hold, in milliseconds. */
  duration?: number
  /** An icon before the words (any library's). */
  iconStart?: ReactNode
  /** The fill's colour; `danger` for what cannot be undone. */
  color?: Color
  size?: 'sm' | 'default' | 'lg'
  /** The done state, controlled: back to false resets the button. */
  confirmed?: boolean
  /** A hold starts or ends, for a hint such as « Continuez d'appuyer ». */
  onHoldChange?: (holding: boolean) => void
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: HoldToConfirmLabels
}

/**
 * A button that acts only once held, for an act a stray tap must not
 * trigger. A fill follows the hold; let go early and it springs back, press
 * again and it carries on from there. Once full, the words and the icon
 * turn into the done state.
 *
 * **Use it for** an inline deletion without a dialog (a photo, a
 * resource), when its consequence is already on screen. **Not for** an act
 * whose consequences must be read first (`ConfirmDialog`), money that
 * leaves (`SlideToConfirm`), or an ordinary action (`Button`).
 *
 * **Where**: in a row or a card, beside what it acts on; one per view.
 *
 * **States**: idle, holding (the fill grows), confirming (spinner and
 * `confirmingLabel` while a promise runs), done (drawn tick, `doneLabel`),
 * disabled.
 *
 * **Key props**: `label`, `doneLabel`, `onConfirm` (may return a promise),
 * `confirmingLabel` (« Suppression »: the dots are added, unless it already
 * ends with « … »), `srLabel` (« Retirer la photo 3 » when several buttons
 * share their words), `duration` (1200 ms), `iconStart`, `color`
 * (`primary`), `size`, `confirmed` (controlled), `onHoldChange`,
 * `labels` to change its words.
 *
 * **Accessibility**: Space or Enter held fills it too (a held key does not
 * repeat); a screen reader's double tap (VoiceOver, TalkBack, a keyboard
 * click) confirms at once. The way to hold it is read as its description,
 * and the result is announced. Phones vibrate briefly at the end, unless
 * motion is reduced.
 *
 * @summary A button that acts only once held.
 */
function HoldToConfirm({
  label,
  srLabel,
  'aria-label': ariaLabel,
  doneLabel,
  confirmingLabel,
  onConfirm,
  duration = 1200,
  iconStart,
  color = 'primary',
  size = 'default',
  confirmed,
  onHoldChange,
  disabled,
  className,
  'aria-describedby': ariaDescribedBy,
  labels,
  ...props
}: HoldToConfirmProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const hintId = useId()
  const [phase, setPhase] = useState<Phase>('idle')
  const done = confirmed ?? phase === 'done'
  const busy = !done && phase === 'confirming'
  const locked = done || busy

  const progress = useMotionValue(0)
  const scale = useMotionValue(1)
  const clipPath = useTransform(
    progress,
    (value) =>
      `inset(0 ${((1 - Math.min(1, Math.max(0, value))) * 100).toFixed(3)}% 0 0)`,
  )
  const [width, measure] = useLabelWidth(reduce)

  const source = useRef<'pointer' | 'key' | null>(null)
  const pointerType = useRef('mouse')
  const fill = useRef<AnimationPlaybackControls | null>(null)
  const press = useRef<AnimationPlaybackControls | null>(null)
  const button = useRef<HTMLButtonElement | null>(null)
  const runRef = useRef(0)
  // A finger or a mouse (not a screen reader) pressed before the click.
  const realPress = useRef(false)

  const words = done
    ? doneLabel
    : busy && confirmingLabel
      ? withEllipsis(confirmingLabel)
      : label
  // Idle, the button says which one it is; busy or done, what happened.
  const name = done || busy ? words : (srLabel ?? ariaLabel ?? label)
  const stage = done ? 'done' : busy ? 'busy' : 'idle'
  const seconds = new Intl.NumberFormat(messages.intlLocale, {
    maximumFractionDigits: 1,
  }).format(duration / 1000)

  const pressTo = (pressed: boolean) => {
    press.current?.stop()
    if (reduce) {
      scale.jump(1)
      return
    }
    // A wide button sinks less, or its edges would travel too far.
    const depth = (button.current?.offsetWidth ?? 0) > 220 ? 0.985 : 0.97
    press.current = animate(scale, pressed ? depth : 1, spring.snappy)
  }

  const stopHolding = () => {
    source.current = null
    setPhase((current) => (current === 'holding' ? 'idle' : current))
    onHoldChange?.(false)
    pressTo(false)
  }

  const complete = () => {
    if (!source.current) {
      return
    }
    const fromTouch = pointerType.current === 'touch'
    stopHolding()
    if (fromTouch && !reduce) {
      navigator.vibrate?.(12)
    }
    const result = onConfirm()
    if (!(result instanceof Promise)) {
      setPhase('done')
      return
    }
    const run = ++runRef.current
    setPhase('confirming')
    result.then(
      () => {
        if (runRef.current === run) {
          setPhase('done')
        }
      },
      () => {
        if (runRef.current === run) {
          setPhase('idle')
        }
      },
    )
  }

  // Starts the fill, or carries it on from where a quick release left it.
  const begin = (from: 'pointer' | 'key') => {
    if (locked || disabled || source.current) {
      return
    }
    source.current = from
    setPhase('holding')
    onHoldChange?.(true)
    pressTo(true)
    fill.current?.stop()
    // The fill lasts the hold itself: it is the product's rule, not a
    // decoration, so it runs even when motion is reduced.
    fill.current = animate(progress, 1, {
      duration: ((1 - progress.get()) * duration) / 1000,
      ease: 'linear',
      onComplete: complete,
    })
  }

  const rewind = () => {
    fill.current?.stop()
    if (reduce) {
      progress.jump(0)
    } else {
      fill.current = animate(progress, 0, { ...spring.smooth, velocity: 0 })
    }
  }

  const release = () => {
    if (!source.current) {
      return
    }
    stopHolding()
    rewind()
  }

  // Keeps the fill in step with the state: full once done, empty after a
  // reset, a refused promise, or a confirmation the parent declined
  // (`confirmed` kept false while the phase went to done).
  const syncFill = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || source.current || phase === 'holding' || busy) {
        return
      }
      const target = done ? 1 : 0
      if (progress.get() === target) {
        return
      }
      fill.current?.stop()
      if (reduce) {
        progress.jump(target)
      } else {
        fill.current = animate(progress, target, spring.smooth)
      }
    },
    [done, busy, phase, reduce, progress],
  )

  // The button itself; whatever still moves stops when it goes.
  const holdButton = useCallback((node: HTMLButtonElement | null) => {
    button.current = node
    if (!node) {
      return undefined
    }
    return () => {
      fill.current?.stop()
      press.current?.stop()
    }
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    // A screen reader's double tap also sends a press, with no contact
    // area: it must not start a hold that its click would let go at once.
    realPress.current = !isVirtualPointer(event.nativeEvent)
    if (!realPress.current || !event.isPrimary || event.button !== 0) {
      return
    }
    pointerType.current = event.pointerType
    event.currentTarget.setPointerCapture(event.pointerId)
    begin('pointer')
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (source.current !== 'pointer') {
      return
    }
    const box = event.currentTarget.getBoundingClientRect()
    if (
      event.clientX < box.left - SLACK ||
      event.clientX > box.right + SLACK ||
      event.clientY < box.top - SLACK ||
      event.clientY > box.bottom + SLACK
    ) {
      release()
    }
  }

  const onPointerEnd = () => {
    if (source.current === 'pointer') {
      release()
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && source.current === 'key') {
      release()
      return
    }
    if (event.key !== ' ' && event.key !== 'Enter') {
      return
    }
    // No click: the key is held, not pressed.
    event.preventDefault()
    if (!event.repeat) {
      begin('key')
    }
  }

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== ' ' && event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    if (source.current === 'key') {
      release()
    }
  }

  const onPointerCancel = () => {
    realPress.current = false
    onPointerEnd()
  }

  // A click that no finger or mouse pressed is a screen reader's double tap
  // (VoiceOver's carries `detail` 1, so `detail` alone cannot tell) or a
  // keyboard's click: it cannot hold, so it confirms at once, the fill
  // running quickly to the end. A real press was already a hold.
  const onClick = () => {
    const fromPointer = realPress.current
    realPress.current = false
    if (fromPointer || locked || disabled || source.current) {
      return
    }
    source.current = 'key'
    fill.current?.stop()
    fill.current = animate(progress, 1, {
      duration: reduce ? 0 : durations.standard,
      ease: 'linear',
      onComplete: complete,
    })
  }

  return (
    <MotionScope>
      <m.button
        {...props}
        ref={holdButton}
        type="button"
        data-slot="hold-to-confirm"
        data-state={done ? 'done' : phase === 'done' ? 'idle' : phase}
        disabled={disabled}
        aria-disabled={locked || undefined}
        aria-busy={busy || undefined}
        aria-label={name}
        aria-describedby={describedBy(ariaDescribedBy, !done && hintId)}
        style={{ scale }}
        className={cn(
          'relative isolate inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-button bg-control font-medium whitespace-nowrap shadow-button outline-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]',
          'transition-[background-color,opacity] duration-150 ease-standard motion-reduce:transition-none',
          'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus',
          'not-disabled:not-aria-disabled:hover:bg-control-hover aria-disabled:cursor-default disabled:cursor-not-allowed disabled:opacity-60',
          sizeOf[size],
          inkOf[color],
          className,
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onPointerEnd}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={release}
        onClick={onClick}
        onContextMenu={(event) => event.preventDefault()}
      >
        <HoldFace
          icon={iconStart}
          stage={stage}
          text={words}
          width={width}
          measure={measure}
        />
        {/* The same face, inverted, cut at the fill's edge. */}
        <m.span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]',
            fillOf[color],
          )}
          style={{ clipPath }}
        >
          <HoldFace
            icon={iconStart}
            stage={stage}
            text={words}
            width={width}
            mirror
          />
        </m.span>
      </m.button>
      <span id={hintId} className="sr-only">
        {messages.holdHint(seconds)}
      </span>
      {/* Also keeps the fill in step: a plain element, so its callback ref
          runs again each time the state changes. */}
      <span ref={syncFill} role="status" className="sr-only">
        {busy ? words : done ? doneLabel : ''}
      </span>
    </MotionScope>
  )
}

export { HoldToConfirm }
export type { HoldToConfirmProps, HoldToConfirmLabels }
