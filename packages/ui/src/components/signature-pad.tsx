// After Arc UI (https://uiarc.dev, MIT licence, Elia Kuratli).

import { useCallback, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { animate } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { ease } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import type {
  SignatureInk,
  SignatureStroke,
  SignatureWidth,
} from '../internal/signature-ink.ts'
import { SignaturePadContext } from '../internal/signature-pad-context.ts'
import type { SignatureReplay } from '../internal/signature-pad-context.ts'
import { cn } from '../lib/cn.ts'

export { SignaturePadAction } from './signature-pad-action.tsx'
export type { SignaturePadActionProps } from './signature-pad-action.tsx'
export { SignaturePadSurface } from './signature-pad-surface.tsx'
export type { SignaturePadSurfaceProps } from './signature-pad-surface.tsx'
export {
  PRINT_INK,
  signatureToPng,
  signatureToSvg,
  svgDataUrl,
  typedNameToDataUrl,
} from '../internal/signature-ink.ts'
export type {
  SignatureInk,
  SignaturePoint,
  SignatureStroke,
  SignatureWidth,
} from '../internal/signature-ink.ts'

/** How many steps undo remembers. */
const HISTORY = 60
/** The clearing sweep, slow enough to be read as one gesture. */
const WIPE_SECONDS = 0.56

type History = {
  past: SignatureStroke[][]
  present: SignatureStroke[]
  future: SignatureStroke[][]
  fresh: string | null
}

type SignaturePadProps = {
  /** The strokes it opens with (a signature drawn earlier). */
  defaultValue?: SignatureStroke[]
  /** The strokes after each change: a stroke, an undo, a redo, a clear. */
  onValueChange?: (strokes: SignatureStroke[]) => void
  /** The ink: black, or a pen's blue. */
  ink?: SignatureInk
  /** The nib: sm, default, lg. */
  width?: SignatureWidth
  disabled?: boolean
  /** Its name for a screen reader; « Signature » by default. */
  label?: string
  /** Printed under the baseline: the signer's name. */
  signer?: string
  /** On the baseline until the first stroke; « Signez ici » by default. */
  hint?: string
  className?: string
  /** `SignaturePadSurface`, then the `SignaturePadAction` buttons. */
  children: ReactNode
}

/**
 * A sheet to sign with a finger, a pen or a mouse, in real ink.
 *
 * **Use it for** a couple signing a contract or an amendment, a check-in
 * sheet. **Prefer** `SignatureField` in a form: it adds the label, the
 * error and the typed-name alternative. **Not for** a drawing.
 *
 * **Where**: at the end of what is signed, full width.
 *
 * **States**: empty (« Signez ici » on the baseline), drawing, signed,
 * replaying, clearing (a squeegee sweeps the ink away), disabled. The sheet
 * stays white in dark mode: a signature lands on a document.
 *
 * **Compose**: `SignaturePad` > `SignaturePadSurface` + a row of
 * `SignaturePadAction action="undo" | "redo" | "replay" | "clear"`.
 *
 * **Key props**: `onValueChange` (the strokes), `defaultValue`, `ink`,
 * `width`, `signer`, `hint`, `label`. Export the strokes with
 * `signatureToPng` (a data URL) or `signatureToSvg`, cropped to the ink.
 *
 * **Accessibility**: the sheet is a focusable image that says how many
 * strokes it holds; Ctrl/Cmd+Z undoes, with Shift redoes, Delete clears;
 * each change is announced. Drawing has no keyboard equivalent: offer the
 * typed name (`SignatureField` does). Reduced motion: the sweep and the
 * replay's easing give way to immediate changes.
 *
 * @summary A sheet to sign with the finger, a pen or a mouse.
 */
function SignaturePad({
  defaultValue,
  onValueChange,
  ink = 'black',
  width = 'default',
  disabled = false,
  label,
  signer,
  hint,
  className,
  children,
}: SignaturePadProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const uid = useId()
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: defaultValue ?? [],
    future: [],
    fresh: null,
  }))
  const [wiping, setWiping] = useState(false)
  const [replay, setReplay] = useState<SignatureReplay | null>(null)
  const [status, setStatus] = useState('')
  const inkRef = useRef<HTMLDivElement | null>(null)
  const registerInk = useCallback((node: HTMLDivElement | null) => {
    inkRef.current = node
  }, [])
  const frame = useRef(0)
  const wipe = useRef<{ complete: () => void } | null>(null)
  const counter = useRef(0)

  const strokes = history.present

  function apply(next: History) {
    setHistory(next)
    onValueChange?.(next.present)
  }

  function commit(next: SignatureStroke[], fresh: string | null = null) {
    apply({
      past: [...history.past, history.present].slice(-HISTORY),
      present: next,
      future: [],
      fresh,
    })
  }

  function stopReplay() {
    cancelAnimationFrame(frame.current)
    setReplay(null)
  }

  function settleWipe() {
    wipe.current?.complete()
  }

  function addStroke(stroke: SignatureStroke) {
    commit([...strokes, stroke], stroke.id)
    setStatus(messages.signatureStrokeAdded(strokes.length + 1))
  }

  function undo() {
    const previous = history.past[history.past.length - 1]
    if (!previous) return
    settleWipe()
    stopReplay()
    apply({
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
      fresh: null,
    })
    setStatus(messages.signatureUndone)
  }

  function redo() {
    const next = history.future[0]
    if (!next) return
    settleWipe()
    stopReplay()
    apply({
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1),
      fresh: null,
    })
    setStatus(messages.signatureRedone)
  }

  function clear() {
    if (!strokes.length || wiping) return
    stopReplay()
    const node = inkRef.current
    const finish = () => {
      wipe.current = null
      commit([])
      setWiping(false)
      setStatus(messages.signatureCleared)
      // The cut is lifted once the wiped strokes are gone, so they never
      // flash back for a frame.
      if (node) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            node.style.clipPath = ''
          }),
        )
      }
    }
    if (!node || reduce) {
      finish()
      return
    }
    setWiping(true)
    // The ink is cut away behind a squeegee's edge crossing the sheet.
    const controls = animate(
      node,
      { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 100%)'] },
      { duration: WIPE_SECONDS, ease: [...ease.inOut] },
    )
    wipe.current = { complete: () => controls.complete() }
    void controls.then(finish)
  }

  function toggleReplay() {
    if (replay) {
      stopReplay()
      setStatus(messages.signatureReplayDone)
      return
    }
    if (!strokes.length) return
    settleWipe()
    // Reduced motion: the signature is already all there; nothing redraws.
    if (reduce) {
      setStatus(messages.signatureReplayDone)
      return
    }
    // Each stroke keeps its own rhythm; the pauses between strokes are kept
    // between 90 and 260ms, and the whole lasts 3.2s at most.
    const offsets: number[] = []
    let cursor = 0
    strokes.forEach((stroke, index) => {
      const previous = strokes[index - 1]
      if (previous) {
        const previousEnd =
          previous.at + (previous.points[previous.points.length - 1]?.t ?? 0)
        cursor += Math.min(260, Math.max(90, stroke.at - previousEnd))
      }
      offsets.push(cursor)
      cursor += stroke.points[stroke.points.length - 1]?.t ?? 0
    })
    const speed = Math.max(1, cursor / 3200)
    const total = cursor + 120
    const begin = performance.now()
    const tick = (now: number) => {
      // The pad left the page: the replay stops with it.
      if (!inkRef.current?.isConnected) return
      const at = (now - begin) * speed
      if (at >= total) {
        setReplay(null)
        setStatus(messages.signatureReplayDone)
        return
      }
      setReplay({ at, offsets })
      frame.current = requestAnimationFrame(tick)
    }
    setReplay({ at: 0, offsets })
    setStatus(messages.signatureReplaying)
    frame.current = requestAnimationFrame(tick)
  }

  return (
    <SignaturePadContext
      value={{
        strokes,
        fresh: history.fresh,
        ink,
        width,
        disabled,
        label: label ?? messages.signature,
        signer,
        hint: hint ?? messages.signHere,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        wiping,
        replay,
        reduce,
        registerInk,
        nextStrokeId: () => `${uid}-${++counter.current}`,
        addStroke,
        undo,
        redo,
        clear,
        toggleReplay,
        stopReplay,
        settleWipe,
      }}
    >
      <MotionScope>
        <div
          data-slot="signature-pad"
          data-disabled={disabled || undefined}
          className={cn('grid w-full min-w-0 gap-2.5', className)}
        >
          {children}
          <p role="status" className="sr-only">
            {status}
          </p>
        </div>
      </MotionScope>
    </SignaturePadContext>
  )
}

export { SignaturePad }
export type { SignaturePadProps }
