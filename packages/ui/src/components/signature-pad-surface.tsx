import { useId, useRef, useState } from 'react'
import type {
  ComponentProps,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { AnimatePresence, m } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, ease } from '../internal/motion.ts'
import {
  NIB,
  PAD_HEIGHT,
  PAD_WIDTH,
  strokePath,
} from '../internal/signature-ink.ts'
import type {
  SignaturePoint,
  SignatureStroke,
} from '../internal/signature-ink.ts'
import { useSignaturePad } from '../internal/signature-pad-context.ts'
import { cn } from '../lib/cn.ts'

/** The ink on screen follows the sheet's (always light) tokens. */
const inkFill = { black: 'fill-fg', blue: 'fill-info-fg' } as const

/** The words SignaturePadSurface writes, to change on one SignaturePadSurface only. */
type SignaturePadSurfaceLabels = Partial<
  Pick<
    GoGoUIMessages,
    'signaturePad' | 'signatureSummary' | 'signatureDrawHint' | 'signatureKeys'
  >
>

type SignaturePadSurfaceProps = Omit<
  ComponentProps<'div'>,
  'children' | 'role' | 'tabIndex'
> & {
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: SignaturePadSurfaceLabels
}

/**
 * The white sheet of a `SignaturePad`: a baseline, a × where to start, the
 * signer's name under it, « Signez ici » until the first stroke. It keeps
 * the pad's 600 × 260 proportions at every width.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary The sheet a SignaturePad is signed on.
 */
function SignaturePadSurface({
  className,
  'aria-describedby': describedBy,
  labels,
  ...props
}: SignaturePadSurfaceProps) {
  const pad = useSignaturePad()
  const { registerInk } = pad
  const messages = useGoGoUIMessages(labels)
  const keysId = useId()
  const [drawing, setDrawing] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)
  const livePath = useRef<SVGPathElement>(null)
  const live = useRef<{
    id: number
    stamp: number
    stroke: SignatureStroke
  } | null>(null)

  function toPad(event: { clientX: number; clientY: number }) {
    const box = sheet.current!.getBoundingClientRect()
    return {
      x: ((event.clientX - box.left) / box.width) * PAD_WIDTH,
      y: ((event.clientY - box.top) / box.height) * PAD_HEIGHT,
    }
  }

  function paintLive() {
    const current = live.current
    if (!current || !livePath.current) return
    livePath.current.setAttribute(
      'd',
      strokePath(current.stroke, Infinity, true),
    )
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (pad.disabled || live.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    pad.settleWipe()
    if (pad.replay) pad.stopReplay()
    sheet.current?.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    const { x, y } = toPad(event)
    const pen = event.pointerType === 'pen' && event.pressure > 0
    live.current = {
      id: event.pointerId,
      stamp: event.nativeEvent.timeStamp,
      stroke: {
        id: pad.nextStrokeId(),
        ink: pad.ink,
        width: pad.width,
        at: event.nativeEvent.timeStamp,
        points: [{ x, y, p: pen ? event.pressure : -1, t: 0 }],
      },
    }
    setDrawing(true)
    paintLive()
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = live.current
    if (!current || current.id !== event.pointerId) return
    const native = event.nativeEvent
    const coalesced =
      typeof native.getCoalescedEvents === 'function'
        ? native.getCoalescedEvents()
        : []
    for (const sample of coalesced.length ? coalesced : [native]) {
      const { x, y } = toPad(sample)
      const pen = sample.pointerType === 'pen' && sample.pressure > 0
      const points = current.stroke.points
      points.push({
        x,
        y,
        p: pen ? sample.pressure : -1,
        t: Math.max(
          points[points.length - 1]?.t ?? 0,
          sample.timeStamp - current.stamp,
        ),
      })
    }
    paintLive()
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const current = live.current
    if (!current || current.id !== event.pointerId) return
    live.current = null
    pad.addStroke(current.stroke)
    livePath.current?.setAttribute('d', '')
    setDrawing(false)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (pad.disabled) return
    const mod = event.metaKey || event.ctrlKey
    const key = event.key.toLowerCase()
    if (mod && key === 'z') {
      event.preventDefault()
      if (event.shiftKey) pad.redo()
      else pad.undo()
    } else if (mod && key === 'y') {
      event.preventDefault()
      pad.redo()
    } else if (
      !mod &&
      (event.key === 'Delete' || event.key === 'Backspace') &&
      event.currentTarget === event.target
    ) {
      event.preventDefault()
      pad.clear()
    } else if (event.key === 'Escape' && pad.replay) {
      pad.stopReplay()
    }
  }

  // During a replay each stroke shows only what was drawn so far, and the
  // nib rides its newest point.
  let nibPoint: SignaturePoint | null = null
  let nibInk = pad.ink
  const visible: { stroke: SignatureStroke; d: string }[] = []
  for (const [index, stroke] of pad.strokes.entries()) {
    const { replay } = pad
    const local = replay ? replay.at - (replay.offsets[index] ?? 0) : Infinity
    const end = stroke.points[stroke.points.length - 1]?.t ?? 0
    if (local < 0) {
      visible.push({ stroke, d: '' })
    } else if (local >= end) {
      visible.push({ stroke, d: strokePath(stroke) })
    } else {
      for (const point of stroke.points) {
        if (point.t > local) break
        nibPoint = point
      }
      nibInk = stroke.ink
      visible.push({ stroke, d: strokePath(stroke, local) })
    }
  }

  const count = pad.strokes.length
  const showHint = count === 0 && !drawing && !pad.wiping
  const hintHidden = pad.reduce
    ? { opacity: 0 }
    : { opacity: 0, y: 6, scale: 0.97, filter: `blur(${blur.soft}px)` }

  return (
    // A drawing sheet: the pointer draws on it and the keyboard undoes,
    // redoes and clears; `img` names it and says how many strokes it holds.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={sheet}
      data-slot="signature-pad-surface"
      data-drawing={drawing || undefined}
      role="img"
      tabIndex={pad.disabled ? -1 : 0}
      aria-roledescription={messages.signaturePad}
      aria-label={`${pad.label}. ${messages.signatureSummary(count)} ${messages.signatureDrawHint}`}
      aria-describedby={[keysId, describedBy].filter(Boolean).join(' ')}
      data-disabled={pad.disabled || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        // `light`: the sheet stays white, its tokens light, in dark mode.
        'light relative isolate aspect-[600/260] w-full touch-none overflow-hidden rounded-2xl bg-surface text-fg ring-1 ring-line outline-none transition-[box-shadow] duration-(--motion-fast) ease-standard select-none ring-inset hover:ring-line-strong focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus data-drawing:ring-line-strong data-disabled:cursor-not-allowed data-disabled:opacity-60 aria-invalid:ring-danger',
        !pad.disabled && 'cursor-crosshair',
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <GoGoIcon
          name="close"
          className="absolute top-[72%] left-[7%] size-3.5 -translate-y-[calc(100%+6px)] text-fg-subtle"
        />
        <span className="absolute top-[72%] right-[7%] left-[7%] border-t-[1.5px] border-dashed border-line-strong" />
        {pad.signer && (
          <span className="absolute top-[calc(72%+8px)] left-[7%] text-xs text-fg-subtle">
            {pad.signer}
          </span>
        )}
        <AnimatePresence initial={false}>
          {showHint && (
            <m.span
              key="hint"
              className="absolute top-[72%] left-1/2 -translate-x-1/2 -translate-y-[calc(100%+8px)] text-lg whitespace-nowrap text-fg-subtle"
              initial={hintHidden}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{
                ...hintHidden,
                transition: {
                  duration: duration.fast,
                  ease: [...ease.standard],
                },
              }}
              transition={{
                duration: duration.standard,
                ease: [...ease.enter],
              }}
            >
              {pad.hint}
            </m.span>
          )}
        </AnimatePresence>
      </div>

      <div ref={registerInk} className="pointer-events-none absolute inset-0">
        <svg
          viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="block size-full overflow-visible"
        >
          <AnimatePresence initial={false}>
            {visible.map(({ stroke, d }) => (
              <m.path
                key={stroke.id}
                className={inkFill[stroke.ink]}
                d={d}
                initial={pad.fresh === stroke.id ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: pad.wiping ? 0 : duration.standard,
                    ease: [...ease.standard],
                  },
                }}
                transition={{
                  duration: duration.standard,
                  ease: [...ease.standard],
                }}
              />
            ))}
          </AnimatePresence>
          <path ref={livePath} className={inkFill[pad.ink]} />
          {nibPoint && (
            <circle
              className={cn(inkFill[nibInk], 'opacity-35')}
              cx={nibPoint.x}
              cy={nibPoint.y}
              r={NIB[pad.width] * 0.9}
            />
          )}
        </svg>
      </div>

      {pad.wiping && (
        <m.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 before:absolute before:inset-y-[8%] before:-left-px before:w-0.5 before:rounded-full before:bg-fg/50 after:absolute after:inset-y-0 after:-left-7 after:w-7 after:bg-linear-to-r after:from-transparent after:to-fg/5"
          initial={{ x: '0%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 0.56,
            ease: [...ease.inOut],
            opacity: { duration: 0.56, times: [0, 0.12, 0.85, 1] },
          }}
        />
      )}

      <span id={keysId} className="sr-only">
        {messages.signatureKeys}
      </span>
    </div>
  )
}

export { SignaturePadSurface }
export type { SignaturePadSurfaceProps, SignaturePadSurfaceLabels }
