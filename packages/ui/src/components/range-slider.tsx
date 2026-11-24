import { useId, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import {
  animate,
  m,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { fill } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { histogram as countBars } from '../internal/histogram.ts'
import { spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

// A thumb chasing its value: stiff enough to stay under the finger, with
// just enough give for its bubble to lean.
const follow = { stiffness: 520, damping: 42 }
// Two bubbles closer than this (px) melt into one.
const MERGE_AT = 92
// After Arc UI's range histogram slider (https://uiarc.dev, MIT): px of
// give past an end, the reach of a bar's edge on release.
const STRETCH = 10
const BIN_SNAP_PX = 9

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))
const rubber = (distance: number) =>
  Math.sign(distance) *
  (1 - 1 / ((Math.abs(distance) * 0.55) / STRETCH + 1)) *
  STRETCH
/** Where a release is heading, from a scroll-like slowdown. */
const project = (velocity: number) => velocity * 0.099

/** The bars inside the range, in the range's colour. */
const litBars: Record<Color, string> = {
  neutral: '*:bg-neutral',
  primary: '*:bg-primary',
  info: '*:bg-info',
  success: '*:bg-success',
  warning: '*:bg-warning',
  danger: '*:bg-danger',
}

/** The words RangeSlider writes, to change on one RangeSlider only. */
type RangeSliderLabels = Partial<
  Pick<GoGoUIMessages, 'andMore' | 'fromNumber' | 'upToNumber' | 'noLimit'>
>

type RangeSliderProps = {
  /** What is ranged, for a screen reader (« Budget »). */
  label: string
  /** The left end, 0 by default; at it, the low bound means « no bound ». */
  min?: number
  /** The right end; at it, the high bound means « no limit ». */
  max: number
  step: number
  /** The bounds chosen; absent, the thumb sits at its end. */
  low: number | undefined
  high: number | undefined
  format: (value: number) => string
  /** The range once a thumb is let go; an end means no bound. */
  onCommit: (range: { min?: number; max?: number }) => void
  /** The range's colour on the track; dark by default. */
  color?: Color
  /**
   * The values the range filters (every request's budget), drawn as bars
   * over the track: the bars inside the range light up. `bins` bars, 32 by
   * default.
   */
  histogram?: { data: readonly number[]; bins?: number }
  /** A thumb let go near a bar's edge settles on it. On with a histogram. */
  snapToBins?: boolean
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: RangeSliderLabels
}

/**
 * Two thumbs on a track choosing a range, their values in bubbles; over
 * it, if given, a histogram of the values it filters.
 *
 * **Use it for** a budget or a number of guests in a filter.
 *
 * **States**: rest, a thumb held (it grows, its bubble leans; over a
 * histogram a hairline rises from it), bubbles merged when close, an end
 * reached (« no limit »).
 *
 * **Key props**: `label`, `low`, `high` (absent: no bound), `min` (0),
 * `max` (at it, « no limit »), `step`, `format` (how a value is written:
 * « 3 000 € »), `onCommit` (when a thumb is let go), `color`, `histogram`
 * (`{ data, bins }`), `snapToBins`, `labels` to change its words.
 *
 * **Accessibility**: each thumb is a slider with its value in words;
 * arrows move a step, Page up/down (and Shift+arrows over a histogram) a
 * bar or ten steps, Home/End to the ends. The histogram is decoration.
 * With reduced motion nothing gives past the ends or glides on.
 *
 * @summary Two thumbs on a track choosing a range.
 */
function RangeSlider({
  label,
  min = 0,
  max,
  step,
  low,
  high,
  format,
  onCommit,
  color,
  histogram,
  snapToBins = histogram !== undefined,
  className,
  labels,
}: RangeSliderProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const track = useRef<HTMLDivElement>(null)
  const span = max - min || 1
  // The values under the finger, until it lifts.
  const [draft, setDraft] = useState<[number, number] | null>(null)
  const [held, setHeld] = useState<0 | 1 | null>(null)
  const lo = draft ? draft[0] : (low ?? min)
  const hi = draft ? draft[1] : (high ?? max)
  const values: [number, number] = [lo, hi]
  const place = (value: number) => clamp((value - min) / span, 0, 1)

  const bins = histogram ? Math.max(1, histogram.bins ?? 32) : 0
  const counts = histogram ? countBars(histogram.data, min, max, bins) : []
  const tallest = Math.max(1, ...counts)
  const binSpan = bins ? span / bins : span

  // Each thumb's place along the track, 0 to 1, on its own spring. The
  // places follow the values while rendering: setting a motion value to
  // where it already is does nothing.
  const placeA = useMotionValue(place(lo))
  const placeB = useMotionValue(place(hi))
  const targetA = place(lo)
  const targetB = place(hi)
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
  // One clip lights the bars inside the range, cut at each thumb.
  const barsClip = useTransform(
    () =>
      `inset(0 ${((1 - clamp(b.get(), 0, 1)) * 100).toFixed(3)}% 0 ${(clamp(a.get(), 0, 1) * 100).toFixed(3)}%)`,
  )
  // A bubble leans against its thumb's speed, a few degrees at most.
  const tiltA = useTransform(useVelocity(springA), (v) =>
    clamp(-v * 6, -12, 12),
  )
  const tiltB = useTransform(useVelocity(springB), (v) =>
    clamp(-v * 6, -12, 12),
  )
  // The held thumb gives a few pixels past an end, then springs back.
  const overA = useMotionValue(0)
  const overB = useMotionValue(0)
  const samples = useRef<{ t: number; v: number }[]>([])

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
    return clamp(min + Math.round((value - min) / step) * step, min, max)
  }

  // A thumb moved: never past the other, one step apart at least.
  function move(thumb: 0 | 1, value: number | ((current: number) => number)) {
    setDraft((previous) => {
      const next: [number, number] = previous ? [...previous] : [lo, hi]
      const wanted = typeof value === 'function' ? value(next[thumb]) : value
      next[thumb] =
        thumb === 0
          ? clamp(snap(wanted), min, Math.min(next[1], max) - step)
          : clamp(snap(wanted), Math.min(next[0], max) + step, max)
      return next
    })
  }

  function commit(range: [number, number]) {
    setDraft(null)
    setHeld(null)
    onCommit({
      min: range[0] <= min ? undefined : range[0],
      max: range[1] >= max ? undefined : range[1],
    })
  }

  function valueAt(clientX: number) {
    const box = track.current?.getBoundingClientRect()
    if (!box || box.width === 0) {
      return min
    }
    return min + clamp((clientX - box.left) / box.width, 0, 1) * span
  }

  /** The finger past an end, in px, for the held thumb's give. */
  function overshoot(clientX: number) {
    const box = track.current?.getBoundingClientRect()
    if (!box) {
      return 0
    }
    return clientX < box.left
      ? clientX - box.left
      : clientX > box.right
        ? clientX - box.right
        : 0
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
    samples.current = [{ t: event.timeStamp, v: value }]
    move(thumb, value)
    document.getElementById(thumbId(thumb))?.focus({ preventScroll: true })
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (held === null) {
      return
    }
    const value = valueAt(event.clientX)
    move(held, value)
    samples.current.push({ t: event.timeStamp, v: value })
    if (samples.current.length > 6) {
      samples.current.shift()
    }
    if (!reduce) {
      ;(held === 0 ? overA : overB).set(rubber(overshoot(event.clientX)))
    }
  }

  /**
   * Over a histogram, the thumb let go may travel one bar more with its
   * momentum, then settles on a bar's edge when one is close.
   */
  function landing(thumb: 0 | 1, range: [number, number], time: number) {
    if (!histogram) {
      return range
    }
    const list = samples.current
    const first = list[0]
    const last = list[list.length - 1]
    const elapsed = first && last ? (last.t - first.t) / 1000 : 0
    const velocity =
      !reduce && first && last && elapsed > 0.008 && time - last.t < 60
        ? (last.v - first.v) / elapsed
        : 0
    let target = range[thumb] + clamp(project(velocity), -binSpan, binSpan)
    if (snapToBins) {
      const edge = min + Math.round((target - min) / binSpan) * binSpan
      const width = track.current?.offsetWidth ?? 0
      if ((Math.abs(edge - target) / span) * width <= BIN_SNAP_PX) {
        target = edge
      }
    }
    const next: [number, number] = [...range]
    next[thumb] =
      thumb === 0
        ? clamp(snap(target), min, Math.min(range[1], max) - step)
        : clamp(snap(target), Math.min(range[0], max) + step, max)
    return next
  }

  function release(thumb: 0 | 1) {
    const over = thumb === 0 ? overA : overB
    if (reduce) {
      over.jump(0)
    } else {
      animate(over, 0, spring.snappy)
    }
  }

  // Over a histogram, a large move goes to the next bar's edge.
  function edgeFrom(now: number, direction: number) {
    const at = (now - min) / binSpan
    const next =
      direction > 0 ? Math.floor(at + 1e-6) + 1 : Math.ceil(at - 1e-6) - 1
    return min + next * binSpan
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
      const large = event.key.startsWith('Page') || event.shiftKey
      move(thumb, (current) =>
        histogram && large
          ? edgeFrom(current, Math.sign(shift))
          : current + shift,
      )
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      move(thumb, event.key === 'Home' ? min : max)
    }
  }

  // The right end is « no limit ».
  const shown = (value: number, thumb: 0 | 1) =>
    thumb === 1 && value >= max ? messages.andMore(format(max)) : format(value)

  // Over a histogram the bubbles float above its bars.
  const bubble = cn(
    'pointer-events-none absolute rounded-lg bg-inverse px-2 py-1 text-xs font-semibold whitespace-nowrap text-fg-inverse tabular-nums',
    histogram ? 'bottom-30' : 'bottom-9',
  )
  const bars = counts.map((count, index) => (
    <span
      key={index}
      className="min-w-0 flex-1 rounded-t-[3px] rounded-b-[1px]"
      style={{
        height: `${count ? Math.max(4, (count / tallest) * 100) : 0}%`,
      }}
    />
  ))

  return (
    <MotionScope>
      <div
        data-slot="range-slider"
        className={cn('relative px-3.5 pt-10 pb-1', className)}
      >
        {histogram && (
          <div
            aria-hidden="true"
            className="pointer-events-none relative mb-2 h-19"
          >
            <div className="absolute inset-0 flex items-end gap-0.5 *:bg-track">
              {bars}
            </div>
            <m.div
              className={cn(
                'absolute inset-0 flex items-end gap-0.5',
                color ? litBars[color] : '*:bg-inverse',
              )}
              style={{ clipPath: barsClip }}
            >
              {bars}
            </m.div>
          </div>
        )}
        <div
          ref={track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => {
            if (held !== null) {
              release(held)
              commit(landing(held, values, event.timeStamp))
            }
          }}
          onPointerCancel={() => {
            if (held !== null) {
              release(held)
            }
            setDraft(null)
            setHeld(null)
          }}
          className="relative h-7 cursor-pointer touch-none"
        >
          <span className="absolute inset-x-0 top-3 h-1 rounded-full bg-tray" />
          <m.span
            className={cn(
              'absolute top-3 h-1 rounded-full bg-inverse',
              color && fill[color],
            )}
            style={{ left: leftA, width: fillWidth }}
          />

          {([0, 1] as const).map((thumb) => (
            <m.span
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
            </m.span>
          ))}
          <m.span
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
          </m.span>

          {([0, 1] as const).map((thumb) => (
            <m.span
              key={thumb}
              id={thumbId(thumb)}
              role="slider"
              tabIndex={0}
              aria-label={`${label} : ${thumb === 0 ? messages.fromNumber : messages.upToNumber}`}
              aria-valuemin={min}
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
              className="absolute top-0 size-7 -translate-x-1/2 cursor-grab rounded-full bg-control shadow-button outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus active:cursor-grabbing"
              style={{
                left: thumb === 0 ? leftA : leftB,
                x: thumb === 0 ? overA : overB,
              }}
              animate={{ scale: held === thumb ? 1.12 : 1 }}
              transition={reduce ? { duration: 0 } : spring.snappy}
            >
              {histogram && (
                // A hairline rises from the held thumb through the bars.
                <span
                  aria-hidden="true"
                  data-on={held === thumb ? '' : undefined}
                  className="pointer-events-none absolute bottom-1/2 left-1/2 h-[calc(50%+0.5rem+4.75rem)] w-px -translate-x-1/2 origin-bottom scale-y-60 bg-fg-subtle opacity-0 transition-[opacity,scale] duration-200 ease-enter data-on:scale-y-100 data-on:opacity-100 motion-reduce:scale-y-100"
                />
              )}
            </m.span>
          ))}
        </div>
      </div>
    </MotionScope>
  )
}

export { RangeSlider }
export type { RangeSliderProps, RangeSliderLabels }
