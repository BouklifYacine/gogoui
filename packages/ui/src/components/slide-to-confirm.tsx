// Slide to Confirm, after Kokonut UI (https://kokonutui.com, MIT licence,
// kokonutUI), on GoGoUI's tokens and icons.
import { useCallback, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { SlideInk } from '../internal/slide-ink.tsx'
import {
  COMMIT_AT,
  EASE_IN_OUT,
  EASE_OUT,
  FLICK_FROM,
  FLICK_SPEED,
  HEIGHT,
  INSET,
  TAP_SLOP,
  THUMB,
  band,
  wait,
} from '../internal/slide-motion.ts'
import type { Phase } from '../internal/slide-motion.ts'
import { SlideThumbIcon } from '../internal/slide-thumb-icon.tsx'
import { cn } from '../lib/cn.ts'

type SlideToConfirmProps = {
  /** « Glissez pour retenir 350,00 € ». */
  label: string
  /** Said while the work runs: « Enregistrement ». */
  confirmingLabel: string
  /** Said once done: « Retenue enregistrée ». */
  doneLabel: string
  /** The work; a rejected promise sends the thumb back. */
  onConfirm: () => Promise<unknown>
  /** Red ink: the action takes something away. */
  destructive?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Slide a thumb to the end to confirm.
 *
 * **Use it for** taking money, sending a contract, an act that cannot be
 * undone and must not happen by a slip. **Prefer** `ConfirmDialog` for an
 * ordinary deletion.
 *
 * **States**: idle, sliding, confirming (`confirmingLabel`), done
 * (`doneLabel`), disabled.
 *
 * **Key props**: `label`, `onConfirm` (returns a promise: the thumb waits
 * for it, a refusal sends it back), `destructive`, `confirmingLabel`,
 * `doneLabel`, `disabled`.
 *
 * **Accessibility**: Enter, Space or a screen reader's double tap confirm
 * in one go, without sliding.
 *
 * @summary Slide a thumb to confirm what cannot be undone.
 */
function SlideToConfirm({
  label,
  confirmingLabel,
  doneLabel,
  onConfirm,
  destructive = false,
  disabled = false,
  className,
}: SlideToConfirmProps) {
  const { slideKeyboardHint } = useGoGoUIMessages()
  const [phase, setPhase] = useState<Phase>('idle')
  const [armed, setArmed] = useState(false)
  const reduceMotion = useReducedMotion()

  // `pressed`: a finger or a mouse went down on the thumb before the click.
  const dragRef = useRef({ pointer: 0, from: 0, moved: false, pressed: false })
  const runRef = useRef(0)

  const x = useMotionValue(0)
  const width = useMotionValue(0)
  // 0: the ink ends at the thumb. 1: it fills the whole track.
  const cover = useMotionValue(0)

  const max = () => Math.max(0, width.get() - THUMB - INSET * 2)

  // The ink runs from the left edge to just past the thumb; once let go
  // it floods the rest.
  const fillClip = useTransform(
    [x, width, cover],
    ([value = 0, total = 0, covered = 0]: number[]) =>
      `inset(0px ${(1 - covered) * Math.max(0, total - value - INSET - THUMB / 2)}px 0px 0px round ${HEIGHT}px)`,
  )
  const fillOpacity = useTransform(x, (value) => Math.min(1, value / 20))
  const labelOpacity = useTransform(
    [x, width],
    ([value = 0, total = 0]: number[]) => {
      const progress = value / Math.max(1, total - THUMB - INSET * 2)
      return Math.max(0, 1 - progress * 0.55)
    },
  )

  // The track's width, read when it shows and each time it changes. A
  // callback ref: a work still running when it goes moves nothing more.
  const watchTrack = useCallback(
    (track: HTMLDivElement | null) => {
      if (!track || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const observer = new ResizeObserver(() => {
        const before = width.get()
        width.set(track.offsetWidth)
        // A thumb at the end stays at the end when the track resizes.
        if (before > 0 && x.get() >= before - THUMB - INSET * 2) {
          x.set(track.offsetWidth - THUMB - INSET * 2)
        }
      })
      observer.observe(track)
      return () => {
        observer.disconnect()
        runRef.current += 1
      }
    },
    [width, x],
  )

  const spring = (velocity = 0) =>
    reduceMotion
      ? { duration: 0.15, ease: EASE_OUT }
      : { type: 'spring' as const, stiffness: 520, damping: 42, velocity }

  // The ink drains back behind the thumb as it springs home.
  const settleBack = (velocity = 0) => {
    setArmed(false)
    setPhase('idle')
    void animate(cover, 0, { duration: reduceMotion ? 0 : 0.3, ease: EASE_OUT })
    void animate(x, 0, spring(velocity))
  }

  // From release to result in one motion: the work starts at once.
  const commit = async (velocity: number, glide = false) => {
    const run = ++runRef.current
    const alive = () => runRef.current === run
    setPhase('confirming')
    setArmed(true)

    const landing = animate(
      x,
      max(),
      glide && !reduceMotion
        ? { duration: 0.42, ease: EASE_IN_OUT }
        : spring(velocity),
    )
    const flooding = animate(cover, 1, {
      duration: reduceMotion ? 0 : 0.36,
      ease: EASE_OUT,
    })

    try {
      // A floor on the wait, so a fast answer does not flash the spinner.
      await Promise.all([onConfirm(), wait(800), landing, flooding])
    } catch {
      if (alive()) {
        settleBack()
      }
      return
    }
    if (alive()) {
      setPhase('done')
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || phase !== 'idle' || event.button !== 0) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    x.stop()
    dragRef.current = {
      pointer: event.clientX,
      from: x.get(),
      moved: false,
      pressed: true,
    }
    setPhase('dragging')
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (phase !== 'dragging') {
      return
    }
    const drag = dragRef.current
    const delta = event.clientX - drag.pointer
    if (Math.abs(delta) > TAP_SLOP) {
      drag.moved = true
    }
    const raw = drag.from + delta
    x.set(band(raw, max()))
    const isArmed = raw >= max() * COMMIT_AT
    if (isArmed !== armed) {
      setArmed(isArmed)
    }
  }

  const onPointerUp = () => {
    if (phase !== 'dragging') {
      return
    }
    if (!dragRef.current.moved) {
      setPhase('idle')
      return
    }
    const velocity = x.getVelocity()
    const progress = x.get() / Math.max(1, max())
    const flicked = velocity > FLICK_SPEED && progress > FLICK_FROM
    if (progress >= COMMIT_AT || flicked) {
      void commit(velocity)
    } else {
      settleBack(velocity)
    }
  }

  const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const { pressed, moved } = dragRef.current
    dragRef.current.pressed = false
    if (disabled || phase !== 'idle') {
      return
    }
    // Enter, Space and a screen reader's double tap click without a
    // pointer, and cannot slide: they confirm in one go.
    if (event.detail === 0 || !pressed) {
      void commit(0, true)
      return
    }
    if (moved || reduceMotion) {
      return
    }
    // A tap shows which way to go: a short nudge that springs back.
    await animate(x, 28, { duration: 0.18, ease: EASE_OUT })
    void animate(x, 0, spring())
  }

  const done = phase === 'done'
  const busy = phase === 'confirming'
  const stageLabel = busy ? `${confirmingLabel}…` : done ? doneLabel : label

  return (
    <div
      data-slot="slide-to-confirm"
      className={cn('relative w-full select-none', className)}
      data-phase={phase}
    >
      <div
        ref={watchTrack}
        className={cn(
          'relative overflow-hidden rounded-full bg-tray',
          disabled && 'opacity-50',
        )}
        style={{ height: HEIGHT }}
      >
        {/* The label on the empty track, nudged off the thumb. */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pl-6 text-sm font-medium whitespace-nowrap text-fg-muted"
          style={{ opacity: labelOpacity }}
        >
          {label}
        </motion.span>

        <SlideInk
          phase={phase}
          stageLabel={stageLabel}
          destructive={destructive}
          reduceMotion={reduceMotion}
          fillClip={fillClip}
          fillOpacity={fillOpacity}
        />

        <motion.button
          type="button"
          aria-disabled={disabled || phase !== 'idle'}
          aria-label={`${label}. ${slideKeyboardHint}`}
          className={cn(
            'absolute flex touch-none items-center justify-center rounded-full bg-control text-fg shadow-button outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus',
            phase === 'idle' && !disabled && 'cursor-grab',
            phase === 'dragging' && 'cursor-grabbing',
          )}
          onClick={(event) => void onClick(event)}
          onPointerCancel={onPointerUp}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ x, left: INSET, top: INSET, width: THUMB, height: THUMB }}
        >
          <SlideThumbIcon armed={armed} busy={busy} done={done} />
        </motion.button>
      </div>

      <span aria-live="polite" className="sr-only">
        {busy && `${confirmingLabel}…`}
        {done && doneLabel}
      </span>
    </div>
  )
}

export { SlideToConfirm }
export type { SlideToConfirmProps }
