import { useId, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import {
  MotionConfig,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'

// A thumb chasing its value: stiff enough to stay under the finger, with
// just enough give for its bubble to lean.
const follow = { stiffness: 520, damping: 42 }
// Two bubbles closer than this (px) melt into one.
const MERGE_AT = 92

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))

type RangeSliderProps = {
  /** What is ranged, for a screen reader (« Budget »). */
  label: string
  /** The right end; at it, the high bound means « no limit ». */
  max: number
  step: number
  /** The bounds chosen; absent, the thumb sits at its end. */
  low: number | undefined
  high: number | undefined
  format: (value: number) => string
  /** The range once a thumb is let go; an end means no bound. */
  onCommit: (range: { min?: number; max?: number }) => void
  className?: string
}

/**
 * A range on a track: two thumbs, each with a bubble over it that leans
 * into its motion; close together, the bubbles melt into one that says the
 * whole range. The ends mean no bound. The range is committed when the
 * finger lifts or the arrow key is released, not at every step. Each
 * thumb is a slider for the keyboard (arrows, Page up and down, Home,
 * End); keep fields beside it for a number typed exactly.
 *
 * @summary Two thumbs on a track choosing a range.
 */
function RangeSlider({
  label,
  max,
  step,
  low,
  high,
  format,
  onCommit,
  className,
}: RangeSliderProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReducedMotion()
  const track = useRef<HTMLDivElement>(null)
  // The values under the finger, until it lifts.
  const [draft, setDraft] = useState<[number, number] | null>(null)
  const [held, setHeld] = useState<0 | 1 | null>(null)
  const lo = draft ? draft[0] : (low ?? 0)
  const hi = draft ? draft[1] : (high ?? max)
  const values: [number, number] = [lo, hi]

  // Each thumb's place along the track, 0 to 1, on its own spring. The
  // places follow the values while rendering: setting a motion value to
  // where it already is does nothing.
  const placeA = useMotionValue(clamp(lo / max, 0, 1))
  const placeB = useMotionValue(clamp(hi / max, 0, 1))
  const targetA = clamp(lo / max, 0, 1)
  const targetB = clamp(hi / max, 0, 1)
  if (placeA.get() !== targetA) {
    placeA.set(targetA)
  }
  if (placeB.get() !== targetB) {
    placeB.set(targetB)
  }
  const springA = useSpring(placeA, follow)
  const springB = useSpring(placeB, follow)
  const a = reduce ? placeA : springA
  const b = reduce ? placeB : springB
  const leftA = useTransform(a, (f) => `${f * 100}%`)
  const leftB = useTransform(b, (f) => `${f * 100}%`)
  const middle = useTransform(() => `${((a.get() + b.get()) / 2) * 100}%`)
  // A bubble sits centred on its thumb, and slides inward at the ends so
  // it never spills out of the track: 0 % shift at the left end, -100 %
  // at the right one.
  const shiftA = useTransform(a, (f) => `${-f * 100}%`)
  const shiftB = useTransform(b, (f) => `${-f * 100}%`)
  const shiftMiddle = useTransform(() => `${-((a.get() + b.get()) / 2) * 100}%`)
  const fillWidth = useTransform(
    () => `${Math.max(0, b.get() - a.get()) * 100}%`,
  )
  // A bubble leans against its thumb's speed, a few degrees at most.
  const tiltA = useTransform(useVelocity(springA), (v) =>
    clamp(-v * 6, -12, 12),
  )
  const tiltB = useTransform(useVelocity(springB), (v) =>
    clamp(-v * 6, -12, 12),
  )

  const [merged, setMerged] = useState(false)
  function checkMerge() {
    const width = track.current?.offsetWidth ?? 0
    const close = (b.get() - a.get()) * width < MERGE_AT
    if (close !== merged) {
      setMerged(close)
    }
  }
  useMotionValueEvent(a, 'change', checkMerge)
  useMotionValueEvent(b, 'change', checkMerge)

  function snap(value: number) {
    return clamp(Math.round(value / step) * step, 0, max)
  }

  // A thumb moved: never past the other, one step apart at least.
  function move(thumb: 0 | 1, value: number | ((current: number) => number)) {
    setDraft((previous) => {
      const next: [number, number] = previous ? [...previous] : [lo, hi]
      const wanted = typeof value === 'function' ? value(next[thumb]) : value
      next[thumb] =
        thumb === 0
          ? clamp(snap(wanted), 0, Math.min(next[1], max) - step)
          : clamp(snap(wanted), Math.min(next[0], max) + step, max)
      return next
    })
  }

  function commit(range: [number, number]) {
    setDraft(null)
    setHeld(null)
    onCommit({
      min: range[0] <= 0 ? undefined : range[0],
      max: range[1] >= max ? undefined : range[1],
    })
  }

  function valueAt(clientX: number) {
    const box = track.current?.getBoundingClientRect()
    if (!box || box.width === 0) {
      return 0
    }
    return clamp((clientX - box.left) / box.width, 0, 1) * max
  }

  const idBase = useId()
  const thumbId = (thumb: 0 | 1) => `${idBase}-thumb-${thumb}`

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }
    const value = valueAt(event.clientX)
    // The thumb nearest the press takes it.
    const thumb: 0 | 1 =
      Math.abs(value - lo) < Math.abs(value - hi) || (lo === hi && value < lo)
        ? 0
        : 1
    event.currentTarget.setPointerCapture(event.pointerId)
    setHeld(thumb)
    move(thumb, value)
    document.getElementById(thumbId(thumb))?.focus({ preventScroll: true })
  }

  function onKeyDown(thumb: 0 | 1, event: KeyboardEvent) {
    const by: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: step * 10,
      PageDown: -step * 10,
    }
    const shift = by[event.key]
    if (shift !== undefined) {
      event.preventDefault()
      move(thumb, (current) => current + shift)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      move(thumb, event.key === 'Home' ? 0 : max)
    }
  }

  // The right end is « no limit ».
  const shown = (value: number, thumb: 0 | 1) =>
    thumb === 1 && value >= max ? messages.andMore(format(max)) : format(value)

  const bubble =
    'pointer-events-none absolute bottom-9 rounded-lg bg-inverse px-2 py-1 text-xs font-semibold whitespace-nowrap text-fg-inverse tabular-nums'

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="range-slider"
        className={cn('relative px-3.5 pt-10 pb-1', className)}
      >
        <div
          ref={track}
          onPointerDown={onPointerDown}
          onPointerMove={(event) => {
            if (held !== null) {
              move(held, valueAt(event.clientX))
            }
          }}
          onPointerUp={() => {
            if (held !== null) {
              commit(values)
            }
          }}
          onPointerCancel={() => {
            setDraft(null)
            setHeld(null)
          }}
          className="relative h-7 cursor-pointer touch-none"
        >
          <span className="absolute inset-x-0 top-3 h-1 rounded-full bg-tray" />
          <motion.span
            className="absolute top-3 h-1 rounded-full bg-inverse"
            style={{ left: leftA, width: fillWidth }}
          />

          {([0, 1] as const).map((thumb) => (
            <motion.span
              key={thumb}
              aria-hidden="true"
              className={bubble}
              style={{
                left: thumb === 0 ? leftA : leftB,
                x: thumb === 0 ? shiftA : shiftB,
                rotate: reduce ? 0 : thumb === 0 ? tiltA : tiltB,
                transformOrigin: '50% 100%',
              }}
              initial={false}
              animate={{
                opacity: merged ? 0 : 1,
                scale: merged ? 0.8 : held === thumb ? 1.08 : 1,
              }}
            >
              {shown(values[thumb], thumb)}
            </motion.span>
          ))}
          <motion.span
            aria-hidden="true"
            className={bubble}
            style={{
              left: middle,
              x: shiftMiddle,
              transformOrigin: '50% 100%',
            }}
            initial={false}
            animate={{ opacity: merged ? 1 : 0, scale: merged ? 1 : 0.8 }}
          >
            {`${format(lo)} – ${shown(hi, 1)}`}
          </motion.span>

          {([0, 1] as const).map((thumb) => (
            <motion.span
              key={thumb}
              id={thumbId(thumb)}
              role="slider"
              tabIndex={0}
              aria-label={`${label} : ${thumb === 0 ? messages.fromNumber : messages.upToNumber}`}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={Math.min(values[thumb], max)}
              aria-valuetext={
                thumb === 1 && values[1] >= max
                  ? messages.noLimit
                  : format(values[thumb])
              }
              onKeyDown={(event) => onKeyDown(thumb, event)}
              onKeyUp={() => {
                if (draft) {
                  commit(draft)
                }
              }}
              onBlur={() => {
                if (draft && held === null) {
                  commit(draft)
                }
              }}
              className="absolute top-0 size-7 -translate-x-1/2 cursor-grab rounded-full bg-control shadow-button outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus active:cursor-grabbing"
              style={{ left: thumb === 0 ? leftA : leftB }}
              animate={{ scale: held === thumb ? 1.12 : 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 16 }}
            />
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}

export { RangeSlider }
export type { RangeSliderProps }
