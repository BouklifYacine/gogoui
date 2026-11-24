import { useCallback, useId, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import type { MotionStyle } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { fill } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './rolling-number.tsx'

type SliderValue = number | readonly number[]
/** A tick on the track; with a label it is printed under it, and a press goes there. */
type SliderMark = { value: number; label?: string }

type SliderProps = Omit<
  SliderPrimitive.Root.Props,
  | 'className'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onValueCommitted'
  | 'orientation'
  | 'thumbAlignment'
  | 'thumbCollisionBehavior'
  | 'locale'
> & {
  /** A number for one thumb, two for a range. */
  value?: SliderValue
  defaultValue?: SliderValue
  /** `details` is absent when the slider moved itself (a thumb let go with momentum, a mark pressed). */
  onValueChange?: (
    value: SliderValue,
    details?: SliderPrimitive.Root.ChangeEventDetails,
  ) => void
  /** Once a thumb is let go or a key moved it: for work too heavy for each step. */
  onValueCommitted?: (
    value: SliderValue,
    details?: SliderPrimitive.Root.CommitEventDetails,
  ) => void
  /** The filled part's colour, the primary by default. */
  color?: Color
  /** Thumb and track: sm 18/4 px, default 22/6 px, lg 26/8 px. */
  size?: 'sm' | 'default' | 'lg'
  /** `elastic`: one value, a track that stretches past its ends and marks the thumb clicks into. */
  variant?: 'default' | 'elastic'
  /** The words above the track; they name the thumbs. */
  label?: string
  /** Writes the value beside the label, its digits rolling. */
  showValue?: boolean
  /** Ticks on the track: values, or `{ value, label }` to print under it. */
  marks?: (number | SliderMark)[]
  /** Beside the track, an icon or a button; the elastic track pushes them. */
  start?: ReactNode
  end?: ReactNode
  /** The elastic variant taps the phone at each mark; never under reduced motion. */
  haptics?: boolean
  className?: string
}

type Drag = {
  pointer: number
  index: number | null
  grab: number
  x: number
  raw: number
  edge: number
  detent: number | null
  type: string
  samples: { t: number; p: number }[]
}

// After Arc UI's slider and elastic slider (https://uiarc.dev, MIT).
// Spring durations as stiffness and damping, so a gesture keeps its speed;
// positions are percents of the track, so rest thresholds sit far below a
// pixel. No spring overshoots, the elastic track's return included.
const physical = (visualDuration: number, restDelta = 0.002) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return {
    type: 'spring' as const,
    stiffness: root * root,
    damping: 2 * root,
    restDelta,
    restSpeed: restDelta * 10,
  }
}
const thumbSpring = physical(spring.snappy.visualDuration)
const kickSpring = physical(spring.morph.visualDuration)
const snapBack = physical(0.5, 0.05)
/** px of give past an end (26 on the elastic track), a key's push at an end, the smallest step momentum may add, a detent's reach. */
const STRETCH = 9
const ELASTIC_STRETCH = 26
const BUMP_PX = 150
const ELASTIC_BUMP_PX = 260
const SNAP_PX = 12
const DETENT_PX = 7
const rubber = (distance: number, limit: number) =>
  Math.sign(distance) *
  (1 - 1 / ((Math.abs(distance) * 0.55) / limit + 1)) *
  limit
/** Where a release is heading, from a scroll-like slowdown. */
const project = (velocity: number) => velocity * 0.099
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))
const decimalsOf = (value: number) => (String(value).split('.')[1] ?? '').length

/** Ticks inside the fill, in the colour of the words on it. */
const tickOn: Record<Color, string> = {
  neutral: 'bg-neutral-foreground/60',
  primary: 'bg-primary-foreground/60',
  info: 'bg-info-foreground/60',
  success: 'bg-success-foreground/60',
  warning: 'bg-warning-foreground/60',
  danger: 'bg-danger-foreground/60',
}

const sizes = {
  sm: { thumb: '[--thumb:18px]', track: 'h-1', control: 'h-8' },
  default: { thumb: '[--thumb:22px]', track: 'h-1.5', control: 'h-9' },
  lg: { thumb: '[--thumb:26px]', track: 'h-2', control: 'h-11' },
}

const bubbleIn = {
  opacity: 0,
  scale: 0.6,
  y: 6,
  filter: `blur(${blur.subtle}px)`,
}
const bubbleRest = {
  opacity: 1,
  scale: 1,
  y: 0,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' },
}
const bubbleOut = {
  opacity: 0,
  scale: 0.8,
  y: 4,
  filter: `blur(${blur.subtle}px)`,
  transition: { duration: duration.instant, ease: ease.standard },
}
const bubbleEnter = {
  ...spring.snappy,
  opacity: { duration: duration.fast, ease: ease.enter },
  filter: { duration: duration.fast, ease: ease.enter },
}
// The bubble centres on its thumb until it would pass an end, then holds
// there: --at is the thumb's place in % of the track, cqw measures it.
const bubbleAnchor =
  'pointer-events-none absolute right-0 bottom-[calc(50%+var(--thumb)/2+8px)] flex [--edge:calc(var(--thumb)/2)] [--x:calc(var(--at,0)*1cqw)] [translate:clamp(calc(100%-var(--edge)-var(--x)),50%,calc(100cqw+var(--edge)-var(--x)))_0] pointer-coarse:bottom-[calc(50%+var(--thumb)/2+18px)]'
const bubbleBody =
  'inline-flex min-h-7 origin-bottom items-center rounded-full bg-inverse px-3 text-sm font-medium whitespace-nowrap text-fg-inverse tabular-nums shadow-inverse'

/**
 * A value, or a range, chosen by dragging: the thumb follows the finger
 * exactly, gives a little past the ends, and settles on a step with the
 * speed it was let go at. A bubble with rolling digits rides it while it
 * moves. After Arc UI (https://uiarc.dev, MIT), on Base UI's slider.
 *
 * **Use it for** an approximate value where seeing the scale helps (a
 * budget, a distance, a percentage). **Not for** an exact number
 * (`NumberField`) or a filter range with « no limit » (`RangeSlider`).
 *
 * **Where**: in a form or a settings panel, full width of its column.
 *
 * **States**: rest, dragging (thumb grows, bubble shows), keyboard focus
 * (ring and bubble), at an end (a key there bumps it), marks (ticks, and
 * labels that can be pressed), disabled. `variant="elastic"`: the track
 * stretches and thins past an end, the bubble trails and sways, marks are
 * detents the thumb clicks into.
 *
 * **Key props**: `value` / `defaultValue` + `onValueChange` (a number, or
 * two for a range), `onValueCommitted`, `min`, `max`, `step`, `largeStep`,
 * `minStepsBetweenValues`, `marks`, `format` (Intl options), `label`,
 * `showValue`, `start` / `end`, `color`, `size`, `variant`, `haptics`.
 *
 * **Accessibility**: Base UI's thumbs: arrows, Shift+arrows and Page
 * up/down by a large step, Home/End; the value is read formatted. Name it
 * with `label`, or `aria-labelledby`. Horizontal only. With reduced motion
 * the thumb jumps, nothing stretches, and the phone never vibrates.
 *
 * @summary Pick a value or a range by dragging.
 */
function Slider({
  className,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step: stepProp = 1,
  largeStep,
  minStepsBetweenValues = 0,
  format,
  color = 'primary',
  size = 'default',
  variant = 'default',
  label,
  showValue = false,
  marks,
  start,
  end,
  haptics = true,
  disabled,
  ...props
}: SliderProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const step = stepProp > 0 ? stepProp : 1
  const span = max - min || 1
  const isRange = Array.isArray(value ?? defaultValue)
  const elastic = variant === 'elastic' && !isRange
  const toArray = (input: SliderValue | undefined): number[] =>
    input === undefined
      ? isRange
        ? [min, max]
        : [min]
      : Array.isArray(input)
        ? [...(input as readonly number[])]
        : [input as number]
  const [inner, setInner] = useState<number[]>(() => toArray(defaultValue))
  const values = value === undefined ? inner : toArray(value)
  const decimals = Math.max(decimalsOf(step), decimalsOf(min))
  const gap = isRange ? minStepsBetweenValues * step : 0
  const pct = (input: number) => ((input - min) / span) * 100
  const valueAt = (percent: number) => min + (percent / 100) * span
  const snap = (input: number) =>
    Number((min + Math.round((input - min) / step) * step).toFixed(decimals))
  const lowOf = (index: number, current: number[]) =>
    index === 1 ? (current[0] ?? min) + gap : min
  const highOf = (index: number, current: number[]) =>
    index === 0 && isRange ? (current[1] ?? max) - gap : max
  const settle = (index: number, input: number, current: number[]) =>
    clamp(
      snap(clamp(input, min, max)),
      lowOf(index, current),
      highOf(index, current),
    )
  const numbers = new Intl.NumberFormat(messages.intlLocale, format)
  const markList = (marks ?? [])
    .map((mark) => (typeof mark === 'number' ? { value: mark } : mark))
    .filter((mark) => mark.value >= min && mark.value <= max)
  const ticks = markList.filter((mark) => mark.value > min && mark.value < max)
  const labelled = markList.filter((mark) => mark.label)

  const latest = useRef(values)
  const goal = useRef(values.map(pct))
  const drag = useRef<Drag | null>(null)
  const lingerTimer = useRef(0)
  const tickRefs = useRef(new Map<number, HTMLSpanElement>())
  const [dragging, setDragging] = useState<number | null>(null)
  const [keyFocus, setKeyFocus] = useState<number | null>(null)
  const [linger, setLinger] = useState<number | null>(null)
  const [lastActive, setLastActive] = useState(isRange ? 1 : 0)
  const railId = useId()
  const [railSize, measureRail] = useElementSize<HTMLDivElement>()
  const railNode = useRef<HTMLDivElement | null>(null)
  const railRef = useCallback(
    (node: HTMLDivElement | null) => {
      railNode.current = node
      return measureRail(node)
    },
    [measureRail],
  )
  // The rail's width in px, a motion value: the transforms read it.
  const railWidth = useMotionValue(1)
  const measuredWidth = railSize?.width || 1
  if (railWidth.get() !== measuredWidth) {
    railWidth.set(measuredWidth)
  }

  // Each thumb is a place plus a catch-up offset: a pressed track springs
  // the offset to zero while the finger moves the place 1:1.
  const pos0 = useMotionValue(pct(values[0] ?? min))
  const pos1 = useMotionValue(pct(values[1] ?? values[0] ?? min))
  const lag0 = useMotionValue(0)
  const lag1 = useMotionValue(0)
  const shown0 = useTransform(() => pos0.get() + lag0.get())
  const shown1 = useTransform(() => pos1.get() + lag1.get())
  const x0 = useTransform(shown0, (at) => `${at - 100}%`)
  const x1 = useTransform(shown1, (at) => `${at - 100}%`)
  const thumbs = [
    { pos: pos0, lag: lag0, shown: shown0, x: x0 },
    { pos: pos1, lag: lag1, shown: shown1, x: x1 },
  ]
  // One clip reveals the fill and its ticks, cut at the thumbs each frame.
  const clipPath = useTransform(() => {
    const from = isRange ? clamp(shown0.get(), 0, 100) : 0
    const to = clamp((isRange ? shown1 : shown0).get(), 0, 100)
    return `inset(0 ${(100 - to).toFixed(3)}% 0 ${from.toFixed(3)}% round 999px)`
  })

  // The elastic track: `over` is how far it is pulled past an end (px),
  // `press` thickens it while held.
  const over = useMotionValue(0)
  const press = useMotionValue(0)
  const scaleX = useTransform(over, (px) => 1 + Math.abs(px) / railWidth.get())
  const originX = useTransform(over, (px) => (px < 0 ? 1 : 0))
  const scaleY = useTransform(
    () =>
      (1 + press.get() * 0.45) *
      (1 - (Math.abs(over.get()) / ELASTIC_STRETCH) * 0.32),
  )
  const startShift = useTransform(over, (px) => Math.min(0, px))
  const endShift = useTransform(over, (px) => Math.max(0, px))
  // The bubble trails the thumb on a soft spring and swings with its speed.
  const trailed = useSpring(shown0, { stiffness: 420, damping: 30, mass: 0.7 })
  const tagX = useTransform(trailed, (at) => `${at - 100}%`)
  const sway = useTransform(useVelocity(trailed), (velocity) =>
    clamp((-velocity / 100) * railWidth.get() * 0.009, -11, 11),
  )

  const emit = (next: number[]): SliderValue =>
    isRange ? next : (next[0] ?? min)

  function commit(
    next: number[],
    details?: SliderPrimitive.Root.ChangeEventDetails,
  ) {
    const current = latest.current
    if (next.every((item, index) => item === current[index])) {
      return
    }
    latest.current = next
    if (value === undefined) {
      setInner(next)
    }
    onValueChange?.(emit(next), details)
  }

  // After each render (a ref given anew each time): a value that changed
  // outside a drag (a key, a mark, the parent) springs its thumb there.
  function syncThumbs(node: HTMLDivElement | null) {
    if (!node) {
      return
    }
    latest.current = values
    values.forEach((item, index) => {
      const target = pct(item)
      const thumb = thumbs[index]
      if (
        !thumb ||
        drag.current?.index === index ||
        goal.current[index] === target
      ) {
        return
      }
      goal.current[index] = target
      const from = thumb.pos.get() + thumb.lag.get()
      thumb.lag.jump(0)
      thumb.pos.jump(from)
      if (reduce) {
        thumb.pos.jump(target)
      } else {
        animate(thumb.pos, target, thumbSpring)
      }
    })
  }

  /** A mark answers with a pop of its tick and, on a phone, a short tap. */
  function pulse(mark: number, vibrate: boolean) {
    const node = tickRefs.current.get(mark)
    if (node && !reduce) {
      animate(
        node,
        { scale: [1, 2.1, 1] },
        { duration: duration.considered, ease: ease.enter },
      )
    }
    if (vibrate && haptics && !reduce && 'vibrate' in navigator) {
      navigator.vibrate(6)
    }
  }

  const detentAt = (percent: number) => {
    let best: number | null = null
    let distance = DETENT_PX + 1
    for (const mark of markList) {
      const px = Math.abs(((percent - pct(mark.value)) / 100) * railWidth.get())
      if (px <= DETENT_PX && px < distance) {
        best = mark.value
        distance = px
      }
    }
    return best
  }

  function holdBubble(index: number) {
    window.clearTimeout(lingerTimer.current)
    setLinger(index)
    lingerTimer.current = window.setTimeout(() => setLinger(null), 700)
  }

  function railPercent(clientX: number) {
    const rect = railNode.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) {
      return null
    }
    railWidth.set(rect.width)
    return ((clientX - rect.left) / rect.width) * 100
  }

  /** Starts following a thumb: a pressed track glides it to the finger. */
  function begin(state: Drag, index: number, at: number, pressed: boolean) {
    const thumb = thumbs[index]
    if (!thumb) {
      return
    }
    const from = thumb.pos.get() + thumb.lag.get()
    state.index = index
    state.grab = pressed ? 0 : at - from
    thumb.lag.jump(0)
    thumb.pos.jump(from)
    setDragging(index)
    setLastActive(index)
    window.clearTimeout(lingerTimer.current)
    setLinger(null)
    if (pressed) {
      follow(state, at, 0, true)
    }
  }

  /** Puts the thumb under the finger, with give past its limits. */
  function follow(state: Drag, at: number, time: number, pressed = false) {
    const index = state.index
    const thumb = index === null ? undefined : thumbs[index]
    if (index === null || !thumb) {
      return
    }
    const current = latest.current
    const width = railWidth.get()
    const raw = at - state.grab
    const low = elastic ? 0 : pct(lowOf(index, current))
    const high = elastic ? 100 : pct(highOf(index, current))
    const edge = clamp(raw, low, high)
    let placed = edge
    if (elastic) {
      over.set(
        reduce ? 0 : rubber(((raw - edge) / 100) * width, ELASTIC_STRETCH),
      )
      const detent = detentAt(edge)
      if (detent !== null) {
        placed = pct(detent)
      }
      if (detent !== state.detent && detent !== null && !pressed) {
        pulse(detent, state.type === 'touch')
      }
      if (detent !== state.detent) {
        pressed = true
      }
      state.detent = detent
    } else if (!reduce) {
      placed =
        edge + (rubber(((raw - edge) / 100) * width, STRETCH) / width) * 100
    }
    if (pressed && !reduce) {
      const from = thumb.pos.get() + thumb.lag.get()
      thumb.pos.jump(placed)
      thumb.lag.jump(from - placed)
      animate(thumb.lag, 0, thumbSpring)
    } else {
      thumb.pos.set(placed)
    }
    state.raw = raw
    state.edge = edge
    state.samples.push({ t: time, p: placed })
    if (state.samples.length > 6) {
      state.samples.shift()
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0 || !event.isPrimary) {
      return
    }
    const at = railPercent(event.clientX)
    if (at === null) {
      return
    }
    const grabbed = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-slot="slider-thumb"]',
    )
    const grabbedIndex = grabbed ? Number(grabbed.dataset.index ?? 0) : null
    const current = latest.current
    const state: Drag = {
      pointer: event.pointerId,
      index: null,
      grab: 0,
      x: event.clientX,
      raw: at,
      edge: at,
      detent: null,
      type: event.pointerType,
      samples: [],
    }
    drag.current = state
    if (elastic) {
      if (reduce) {
        press.jump(1)
      } else {
        animate(press, 1, spring.snappy)
      }
    }
    // Stacked range thumbs wait for the first move to know which one is meant.
    if (grabbedIndex !== null && isRange && current[0] === current[1]) {
      return
    }
    const lowDistance = Math.abs(at - pct(current[0] ?? min))
    const highDistance = Math.abs(at - pct(current[1] ?? max))
    const nearest = !isRange
      ? 0
      : lowDistance === highDistance
        ? at < pct(current[0] ?? min)
          ? 0
          : 1
        : lowDistance < highDistance
          ? 0
          : 1
    begin(state, grabbedIndex ?? nearest, at, grabbedIndex === null)
    state.samples = [
      { t: event.timeStamp, p: thumbs[state.index ?? 0]?.pos.get() ?? 0 },
    ]
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) {
      return
    }
    const at = railPercent(event.clientX)
    if (at === null) {
      return
    }
    if (state.index === null) {
      const dx = event.clientX - state.x
      if (Math.abs(dx) < 2) {
        return
      }
      begin(state, dx < 0 ? 0 : 1, at, false)
    }
    follow(state, at, event.timeStamp)
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) {
      return
    }
    drag.current = null
    if (elastic) {
      if (reduce) {
        over.jump(0)
        press.jump(0)
      } else {
        animate(over, 0, { ...snapBack, velocity: over.getVelocity() })
        animate(press, 0, spring.snappy)
      }
    }
    const index = state.index
    const thumb = index === null ? undefined : thumbs[index]
    if (index === null || !thumb) {
      return
    }
    const current = latest.current
    const samples = state.samples
    const first = samples[0]
    const last = samples[samples.length - 1]
    const elapsed = first && last ? (last.t - first.t) / 1000 : 0
    // The speed of the last few frames, % per second; a finger that paused
    // before letting go carries none.
    const velocity =
      (first && last && elapsed > 0.008 && event.timeStamp - last.t < 60
        ? (last.p - first.p) / elapsed
        : 0) + thumb.lag.getVelocity()
    let next: number
    if (elastic) {
      next = state.detent ?? settle(index, valueAt(state.edge), current)
    } else {
      // On a coarse grid, momentum may carry the thumb one step further.
      const stepPct = (step / span) * 100
      const carry =
        event.type === 'pointerup' &&
        (stepPct / 100) * railWidth.get() >= SNAP_PX
          ? clamp(project(velocity), -stepPct, stepPct)
          : 0
      next = settle(index, valueAt(state.raw + carry), current)
    }
    const from = thumb.pos.get() + thumb.lag.get()
    const target = pct(next)
    thumb.lag.jump(0)
    thumb.pos.jump(from)
    goal.current[index] = target
    if (reduce) {
      thumb.pos.jump(target)
    } else {
      animate(thumb.pos, target, { ...thumbSpring, velocity })
    }
    commit(current.map((item, at) => (at === index ? next : item)))
    setDragging(null)
    holdBubble(index)
  }

  function handleValueChange(
    next: SliderValue,
    details: SliderPrimitive.Root.ChangeEventDetails,
  ) {
    const state = drag.current
    const taken = details.activeThumbIndex
    if (state && isRange && state.index !== null && state.index !== taken) {
      // Base UI took the other thumb: the first goes home, follow the other.
      const left = thumbs[state.index]
      if (left) {
        animate(left.pos, goal.current[state.index] ?? 0, thumbSpring)
      }
      state.index = taken
      setDragging(taken)
      setLastActive(taken)
    }
    const values = toArray(next)
    // On the elastic track a mark holds the thumb for a few pixels.
    if (elastic && state?.detent != null) {
      values[0] = state.detent
    }
    commit(values, details)
  }

  function onThumbKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    const toward = ['ArrowRight', 'ArrowUp', 'PageUp', 'End'].includes(
      event.key,
    )
      ? 1
      : ['ArrowLeft', 'ArrowDown', 'PageDown', 'Home'].includes(event.key)
        ? -1
        : 0
    if (toward === 0) {
      return
    }
    setKeyFocus(index)
    setLastActive(index)
    const current = latest.current
    const now = current[index] ?? min
    const stuck =
      toward > 0 ? now >= highOf(index, current) : now <= lowOf(index, current)
    // At an end the thumb strains toward the key and springs home.
    if (stuck && !reduce) {
      if (elastic) {
        animate(over, 0, { ...snapBack, velocity: toward * ELASTIC_BUMP_PX })
      } else {
        const thumb = thumbs[index]
        if (thumb) {
          animate(thumb.pos, goal.current[index] ?? pct(now), {
            ...kickSpring,
            velocity: ((toward * BUMP_PX) / railWidth.get()) * 100,
          })
        }
      }
    }
  }

  function jumpTo(target: number) {
    if (disabled) {
      return
    }
    const current = latest.current
    const index =
      isRange &&
      Math.abs(target - (current[1] ?? max)) <
        Math.abs(target - (current[0] ?? min))
        ? 1
        : 0
    const next = settle(index, target, current)
    setLastActive(index)
    if (next === current[index]) {
      return
    }
    const updated = current.map((item, at) => (at === index ? next : item))
    commit(updated)
    if (elastic && markList.some((mark) => mark.value === next)) {
      pulse(next, false)
    }
    onValueCommitted?.(emit(updated))
  }

  const sizing = sizes[size]
  const inRange = (mark: number) =>
    isRange
      ? mark >= (values[0] ?? min) && mark <= (values[1] ?? max)
      : mark <= (values[0] ?? min)
  const text = (input: number) => numbers.format(input)
  const showBubble = (index: number) =>
    dragging === index || keyFocus === index || linger === index
  const tick = 'absolute top-1/2 -mt-0.5 -ml-0.5 size-1 rounded-full'
  // The drawn thumb: it grows while held, rings while focused by keys.
  const thumbDot = (index: number, grow: number) => (
    <motion.span
      aria-hidden="true"
      data-focused={keyFocus === index ? '' : undefined}
      className="absolute top-1/2 right-0 size-(--thumb) translate-x-1/2 -translate-y-1/2 rounded-full bg-control shadow-button outline-offset-2 data-focused:outline-2 data-focused:outline-solid data-focused:outline-focus"
      initial={false}
      animate={{ scale: dragging === index ? grow : 1 }}
      transition={reduce ? { duration: 0 } : spring.snappy}
    />
  )

  return (
    <MotionScope>
      <SliderPrimitive.Root
        ref={syncThumbs}
        data-slot="slider"
        data-variant={variant}
        value={isRange ? values : (values[0] ?? min)}
        onValueChange={handleValueChange}
        onValueCommitted={(_, details) =>
          onValueCommitted?.(emit(latest.current), details)
        }
        min={min}
        max={max}
        step={step}
        largeStep={largeStep}
        minStepsBetweenValues={minStepsBetweenValues}
        format={format}
        locale={messages.intlLocale}
        disabled={disabled}
        thumbAlignment="edge"
        thumbCollisionBehavior="none"
        className={cn(
          'grid w-full min-w-0 gap-1 text-sm text-fg select-none data-disabled:opacity-50',
          sizing.thumb,
          className,
        )}
        {...props}
      >
        {(label || showValue) && (
          <div className="flex min-w-0 items-baseline justify-between gap-4">
            {label ? (
              <SliderPrimitive.Label className="min-w-0 font-medium">
                {label}
              </SliderPrimitive.Label>
            ) : (
              <span />
            )}
            {showValue && (
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 text-fg-muted tabular-nums transition-opacity duration-150',
                  elastic && dragging !== null && 'opacity-0',
                )}
              >
                <RollingNumber value={values[0] ?? min} format={format} />
                {isRange && (
                  <>
                    <span className="text-fg-subtle">–</span>
                    <RollingNumber value={values[1] ?? max} format={format} />
                  </>
                )}
              </span>
            )}
          </div>
        )}
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          {start && (
            <motion.span
              aria-hidden={elastic || undefined}
              className="col-start-1 mr-3 flex text-fg-muted"
              style={elastic ? { x: startShift } : undefined}
            >
              {start}
            </motion.span>
          )}
          <SliderPrimitive.Control
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            className={cn(
              'relative col-start-2 cursor-pointer touch-none data-disabled:cursor-not-allowed data-dragging:cursor-grabbing',
              sizing.control,
            )}
          >
            <div
              ref={railRef}
              id={`${railId}-rail`}
              className={cn(
                'absolute inset-x-[calc(var(--thumb)/2)] top-1/2 -translate-y-1/2',
                elastic ? 'h-2' : sizing.track,
              )}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-track"
                style={elastic ? { scaleX, scaleY, originX } : undefined}
              >
                {!elastic &&
                  ticks.map((mark) => (
                    <span
                      key={mark.value}
                      className={cn(tick, 'bg-track-strong')}
                      style={{ left: `${pct(mark.value)}%` }}
                    />
                  ))}
                <motion.div
                  className={cn('absolute inset-0 rounded-full', fill[color])}
                  style={{ clipPath }}
                >
                  {!elastic &&
                    ticks.map((mark) => (
                      <span
                        key={mark.value}
                        className={cn(tick, tickOn[color])}
                        style={{ left: `${pct(mark.value)}%` }}
                      />
                    ))}
                </motion.div>
              </motion.div>
              {elastic &&
                ticks.map((mark) => (
                  <span
                    key={mark.value}
                    ref={(node) => {
                      if (node) {
                        tickRefs.current.set(mark.value, node)
                      } else {
                        tickRefs.current.delete(mark.value)
                      }
                    }}
                    className={cn(
                      tick,
                      'pointer-events-none transition-colors duration-150',
                      mark.value <= (values[0] ?? min)
                        ? tickOn[color]
                        : 'bg-track-strong',
                    )}
                    style={{ left: `${pct(mark.value)}%` }}
                  />
                ))}
            </div>

            {/* The drawn thumbs and bubbles; Base UI's thumbs, invisible,
                sit on them and take the focus and the keys. */}
            <div className="pointer-events-none absolute inset-y-0 inset-x-[calc(var(--thumb)/2)] @container">
              {elastic ? (
                <>
                  <motion.div
                    className="absolute inset-0"
                    style={{ x: reduce ? x0 : tagX }}
                  >
                    <motion.span
                      className={bubbleAnchor}
                      style={
                        {
                          x: over,
                          '--at': reduce ? shown0 : trailed,
                        } as MotionStyle
                      }
                    >
                      <AnimatePresence>
                        {showBubble(0) && (
                          <motion.span
                            key="bubble"
                            aria-hidden="true"
                            className={cn(bubbleBody, 'origin-[50%_130%]')}
                            style={{ rotate: reduce ? 0 : sway }}
                            initial={reduce ? { opacity: 0 } : bubbleIn}
                            animate={bubbleRest}
                            exit={
                              reduce
                                ? {
                                    opacity: 0,
                                    transition: { duration: duration.instant },
                                  }
                                : bubbleOut
                            }
                            transition={
                              reduce ? { duration: duration.fast } : bubbleEnter
                            }
                          >
                            {text(values[0] ?? min)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.span>
                  </motion.div>
                  <motion.div className="absolute inset-0" style={{ x: x0 }}>
                    <motion.div
                      className="absolute inset-0"
                      style={{ x: over }}
                    >
                      {thumbDot(0, 1.28)}
                    </motion.div>
                  </motion.div>
                </>
              ) : (
                values.map((item, index) => {
                  const thumb = thumbs[index]
                  return thumb ? (
                    <motion.div
                      key={index}
                      className="absolute inset-0"
                      style={{
                        x: thumb.x,
                        zIndex: lastActive === index ? 2 : 1,
                      }}
                    >
                      {thumbDot(index, 1.16)}
                      <motion.span
                        className={bubbleAnchor}
                        style={{ '--at': thumb.shown } as MotionStyle}
                      >
                        <AnimatePresence>
                          {showBubble(index) && (
                            <motion.span
                              key="bubble"
                              aria-hidden="true"
                              className={bubbleBody}
                              initial={reduce ? { opacity: 0 } : bubbleIn}
                              animate={bubbleRest}
                              exit={
                                reduce
                                  ? {
                                      opacity: 0,
                                      transition: {
                                        duration: duration.instant,
                                      },
                                    }
                                  : bubbleOut
                              }
                              transition={
                                reduce
                                  ? { duration: duration.instant }
                                  : bubbleEnter
                              }
                            >
                              <RollingNumber value={item} format={format} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.span>
                    </motion.div>
                  ) : null
                })
              )}
            </div>

            {values.map((_, index) => (
              <SliderPrimitive.Thumb
                key={index}
                index={index}
                data-slot="slider-thumb"
                // The thumb is what gets the focus: the name goes on it.
                aria-labelledby={ariaLabelledBy}
                getAriaLabel={
                  isRange && label
                    ? (at) =>
                        `${label} : ${at === 0 ? messages.fromNumber : messages.upToNumber}`
                    : undefined
                }
                onKeyDown={(event) => onThumbKeyDown(index, event)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(':focus-visible')) {
                    setKeyFocus(index)
                  }
                }}
                onBlur={() =>
                  setKeyFocus((focused) => (focused === index ? null : focused))
                }
                className="size-(--thumb) rounded-full opacity-0 outline-none after:absolute after:-inset-2.5 after:rounded-full"
              />
            ))}
          </SliderPrimitive.Control>
          {end && (
            <motion.span
              aria-hidden={elastic || undefined}
              className="col-start-3 ml-3 flex text-fg-muted"
              style={elastic ? { x: endShift } : undefined}
            >
              {end}
            </motion.span>
          )}
          {labelled.length > 0 && (
            <div
              aria-hidden="true"
              className="relative col-start-2 mx-[calc(var(--thumb)/2)] -mt-1 h-5 text-xs text-fg-subtle tabular-nums"
            >
              {labelled.map((mark) => (
                <button
                  key={mark.value}
                  type="button"
                  tabIndex={-1}
                  data-on={
                    (elastic ? mark.value === values[0] : inRange(mark.value))
                      ? ''
                      : undefined
                  }
                  className={cn(
                    'absolute top-0 cursor-pointer whitespace-nowrap transition-colors duration-150 hover:text-fg data-on:text-fg-muted',
                    mark.value === min
                      ? 'translate-x-[max(-50%,calc(var(--thumb)/-2))]'
                      : mark.value === max
                        ? 'translate-x-[min(-50%,calc(-100%+var(--thumb)/2))]'
                        : '-translate-x-1/2',
                  )}
                  style={{ left: `${pct(mark.value)}%` }}
                  onClick={() => jumpTo(mark.value)}
                >
                  {mark.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </SliderPrimitive.Root>
    </MotionScope>
  )
}

export { Slider }
export type { SliderMark, SliderProps, SliderValue }
