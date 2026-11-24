import { useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { animate } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import { stagger } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { RatingStar } from '../internal/rating-star.tsx'
import { RollingWords } from '../internal/rolling-words.tsx'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { cn } from '../lib/cn.ts'

type RatingProps = {
  /** The chosen value, when the parent owns it (controlled); 0 when none. */
  value?: number
  /** The first value when the stars own it (uncontrolled); 0 by default. */
  defaultValue?: number
  /** The new value, controlled or not; 0 when cleared. */
  onValueChange?: (value: number) => void
  onBlur?: () => void
  /** How many stars, 5 by default. */
  max?: number
  size?: 'sm' | 'default' | 'lg'
  /** The stars' colour, warning (amber) by default. */
  color?: Color
  /** The pointer, a finger and the arrows move by half stars. */
  allowHalf?: boolean
  /** Choosing the value again clears it; so do Backspace and Delete. */
  allowClear?: boolean
  /** The word or the figure of the value beside the stars. */
  showValue?: boolean
  /** One word per whole star; « Mauvais … Excellent » for five stars. */
  valueLabels?: readonly string[]
  /** Shows a value, without a way to change it. */
  readOnly?: boolean
  disabled?: boolean
  /** The name sent with a form. */
  name?: string
  id?: string
  /** The group's name, « Note » by default; or `aria-labelledby`. */
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  className?: string
}

// spring.snappy as physics: a time-defined spring drops the start
// velocity, and a pop is nothing but velocity.
const SNAPPY_ROOT = (2 * Math.PI) / (0.2 * 1.2)
const POP = {
  type: 'spring',
  stiffness: SNAPPY_ROOT ** 2,
  damping: 2 * SNAPPY_ROOT,
  // Scale per second given to a star at rest: it peaks near 1.18.
  velocity: 9,
} as const
// Choices closer than this pop only the chosen star, so held arrows stay calm.
const WAVE_GAP = 260

const sizes = {
  sm: '[--cell:28px] [--glyph:18px]',
  default: '[--cell:36px] [--glyph:24px]',
  lg: '[--cell:44px] [--glyph:30px]',
} as const

type Gesture = { last: number; scrub: boolean; touch: boolean }

/**
 * A rating in stars, after Arc UI (https://uiarc.dev, MIT).
 *
 * **Use it for** a quick opinion on a scale (a couple's review after the
 * event, a request's priority). **Not for** a number to type
 * (`NumberField`) or a level from a list (`SelectField`).
 *
 * **Where**: in a form (`RatingField` gives it a label, help and error),
 * or read-only in a card or a table row.
 *
 * **States**: empty, rated, previewed under the pointer, read-only,
 * disabled, invalid (`aria-invalid`).
 *
 * **Key props**: `value` + `onValueChange` (0 = cleared), `max` (5),
 * `size` (sm, default, lg), `color` (warning by default), `allowHalf`,
 * `allowClear`, `showValue`, `valueLabels`, `readOnly`, `disabled`,
 * `name`.
 *
 * **Motion**: the fill sweeps each star from the left, one after the
 * other; a faint mark keeps the chosen value under a preview; the chosen
 * star pops (the whole row, in a wave, after a pause); a press sinks a
 * star; the value's word rolls. With reduced motion everything is
 * immediate.
 *
 * **Accessibility**: a radio group with one tab stop; arrows, Home / End,
 * 1 to 9, Backspace / Delete; each star is named (« Bien, 3 sur 5
 * étoiles ») and a choice is announced. A visible focus ring on the star.
 * Read-only, it is one image named by its value.
 *
 * @summary A rating in stars, with half stars and a rolling word.
 */
function Rating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onBlur,
  max = 5,
  size = 'default',
  color = 'warning',
  allowHalf = false,
  allowClear = true,
  showValue = true,
  valueLabels,
  readOnly = false,
  disabled = false,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  className,
}: RatingProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const step = allowHalf ? 0.5 : 1
  const normalize = (next: number) =>
    Math.max(0, Math.min(max, Math.round(next / step) * step))
  const [preview, setPreview] = useState<number | null>(null)
  const [pressed, setPressed] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const current = normalize(value)
  const shown = preview ?? current
  // Where the shown value came from, so the fill sweeps away from it and
  // the word rolls the same way.
  const [sweep, setSweep] = useState({ from: shown, to: shown })
  if (sweep.to !== shown) {
    setSweep({ from: sweep.to, to: shown })
  }
  const direction = sweep.to >= sweep.from ? 1 : -1
  const cells = useRef<(HTMLSpanElement | null)[]>([])
  const pops = useRef<(HTMLSpanElement | null)[]>([])
  const radios = useRef<(HTMLButtonElement | null)[]>([])
  const group = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  // After a pointer choice, the preview steps aside until the pointer
  // reaches another value.
  const heldAt = useRef<number | null>(null)
  const ignoreClickUntil = useRef(0)
  const lastChoice = useRef(0)
  const interactive = !readOnly && !disabled

  const figure = new Intl.NumberFormat(messages.intlLocale, {
    maximumFractionDigits: 1,
  })
  const words =
    valueLabels ?? (max === 5 && !allowHalf ? messages.ratingLevels : undefined)
  const wordFor = (next: number) =>
    Number.isInteger(next) ? words?.[next - 1] : undefined
  const textFor = (next: number) =>
    next <= 0
      ? messages.ratingNone
      : (wordFor(next) ?? `${figure.format(next)} / ${max}`)
  const spokenFor = (next: number) =>
    [wordFor(next), messages.ratingOf(figure.format(next), max)]
      .filter(Boolean)
      .join(', ')
  const steps = Array.from(
    { length: Math.round(max / step) },
    (_, index) => (index + 1) * step,
  )

  // The chosen star pops; after a pause, the whole row pops in a wave.
  const pop = (chosen: number, time: number) => {
    const wave = time - lastChoice.current > WAVE_GAP
    lastChoice.current = time
    if (reduce || chosen <= 0) {
      return
    }
    const last = Math.ceil(chosen) - 1
    for (let index = 0; index <= last; index += 1) {
      const star = pops.current[index]
      if (star && (wave || index === last)) {
        animate(
          star,
          { scale: 1 },
          { ...POP, delay: wave ? index * stagger.item : 0 },
        )
      }
    }
  }

  /** `time` is the event's timeStamp. */
  const choose = (
    next: number,
    time: number,
    { toggle = false, announce = true } = {},
  ) => {
    if (!interactive) {
      return
    }
    let chosen = normalize(next)
    if (toggle && allowClear && chosen === current) {
      chosen = 0
    }
    if (!allowClear) {
      chosen = Math.max(step, chosen)
    }
    if (preview !== null) {
      heldAt.current = preview
    }
    setPreview(null)
    pop(chosen, time)
    if (announce) {
      setAnnouncement(chosen === 0 ? messages.ratingCleared : spokenFor(chosen))
    }
    if (chosen !== current) {
      setValue(chosen)
    }
  }

  /** The value under the pointer; past the first star clears, when allowed. */
  const valueAt = (x: number) => {
    for (let index = 0; index < max; index += 1) {
      const rect = cells.current[index]?.getBoundingClientRect()
      if (!rect) {
        continue
      }
      if (index === 0 && x < rect.left - rect.width / 2) {
        return allowClear ? 0 : step
      }
      if (x <= rect.right + 1 || index === max - 1) {
        return allowHalf && x < rect.left + rect.width / 2
          ? index + 0.5
          : index + 1
      }
    }
    return current
  }
  const starOf = (next: number) => (next > 0 ? Math.ceil(next) - 1 : null)

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0) {
      return
    }
    const at = valueAt(event.clientX)
    const touch = event.pointerType !== 'mouse'
    gesture.current = { last: at, scrub: false, touch }
    // A finger keeps being followed once it leaves the stars.
    if (touch) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Capture is a nicety.
      }
      setPreview(at)
    }
    setPressed(starOf(at))
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) {
      return
    }
    const at = valueAt(event.clientX)
    const active = gesture.current
    if (active) {
      if (at !== active.last) {
        active.last = at
        active.scrub = true
      }
      setPressed(starOf(at))
      if (active.touch || active.scrub) {
        setPreview(at)
      }
      return
    }
    if (event.pointerType !== 'mouse' || heldAt.current === at) {
      return
    }
    heldAt.current = null
    setPreview(at)
  }
  const endGesture = (
    event: PointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    const active = gesture.current
    gesture.current = null
    setPressed(null)
    if (!active) {
      return
    }
    if (!cancelled && (active.touch || active.scrub)) {
      const at = valueAt(event.clientX)
      // The browser may still send a click: the pointer already chose.
      ignoreClickUntil.current = event.timeStamp + 500
      choose(at, event.timeStamp, { toggle: !active.scrub })
      heldAt.current = active.touch ? null : at
      // A drag that began on another star leaves the focus there.
      if (active.scrub && group.current?.contains(document.activeElement)) {
        radios.current[
          Math.max(0, Math.round(normalize(at) / step) - 1)
        ]?.focus({ preventScroll: true })
      }
    }
    if (active.touch) {
      setPreview(null)
    }
  }
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.touch) {
      return
    }
    gesture.current = null
    heldAt.current = null
    setPressed(null)
    if (event.pointerType === 'mouse') {
      setPreview(null)
    }
  }
  const onClick = (event: MouseEvent<HTMLButtonElement>, next: number) => {
    if (event.detail > 0 && event.timeStamp < ignoreClickUntil.current) {
      return
    }
    choose(next, event.timeStamp, { toggle: true })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, own: number) => {
    const moves: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      Home: step,
      End: max,
    }
    let next: number | undefined = moves[event.key]
    let announce = false
    if (event.key === ' ' || event.key === 'Enter') {
      next = own
    }
    if ((event.key === 'Backspace' || event.key === 'Delete') && allowClear) {
      next = 0
      announce = true
    }
    if (/^[1-9]$/.test(event.key) && Number(event.key) <= max) {
      next = Number(event.key)
    }
    if (next === undefined) {
      return
    }
    event.preventDefault()
    const chosen = next === 0 ? 0 : Math.max(step, Math.min(max, next))
    choose(chosen, event.timeStamp, { announce })
    radios.current[Math.max(0, Math.round(chosen / step) - 1)]?.focus()
  }
  const onGroupBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onBlur?.()
    }
  }

  const tabStop = current > 0 ? current : step
  const label = ariaLabel ?? (labelledBy ? undefined : messages.rating)
  const radio = (next: number, half: boolean) => (
    <button
      key={next}
      ref={(node) => {
        radios.current[Math.round(next / step) - 1] = node
      }}
      type="button"
      role="radio"
      aria-checked={current === next}
      aria-label={spokenFor(next)}
      tabIndex={interactive && next === tabStop ? 0 : -1}
      disabled={disabled}
      onClick={(event) => onClick(event, next)}
      onKeyDown={(event) => onKeyDown(event, next)}
      className={cn(
        'absolute inset-0 cursor-pointer rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus disabled:cursor-default',
        // The leading half, above the whole star.
        half && 'z-1 rounded-e-none [inset-inline-end:50%]',
      )}
    />
  )

  return (
    <MotionScope>
      <div
        data-slot="rating"
        data-disabled={disabled || undefined}
        className={cn(
          'inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5',
          sizes[size],
          className,
        )}
      >
        <div
          ref={group}
          id={id}
          role={readOnly ? 'img' : 'radiogroup'}
          aria-label={
            readOnly
              ? `${label ?? messages.rating}, ${current > 0 ? spokenFor(current) : messages.ratingNone}`
              : label
          }
          aria-labelledby={readOnly ? undefined : labelledBy}
          aria-describedby={describedBy}
          aria-invalid={readOnly ? undefined : invalid}
          aria-disabled={disabled || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => endGesture(event)}
          onPointerCancel={(event) => endGesture(event, true)}
          onPointerLeave={onPointerLeave}
          onBlur={onGroupBlur}
          className={cn(
            // Cells are wider than their stars: the first star lines up
            // with the text above.
            'mx-[calc((var(--glyph)-var(--cell))/2)] inline-flex touch-pan-y gap-0.5 select-none',
            disabled && 'opacity-50',
          )}
        >
          {Array.from({ length: max }, (_, index) => {
            const fill = Math.max(0, Math.min(1, shown - index))
            const order =
              sweep.to > sweep.from
                ? index - Math.floor(sweep.from)
                : Math.ceil(sweep.from) - 1 - index
            return (
              <span
                key={index}
                ref={(node) => {
                  cells.current[index] = node
                }}
                className="relative grid size-(--cell) shrink-0 place-items-center rounded-md"
              >
                <RatingStar
                  fill={fill}
                  value={Math.max(0, Math.min(1, current - index))}
                  delay={Math.max(0, order) * stagger.item}
                  rated={shown > 0}
                  pressed={pressed === index}
                  color={color}
                  popRef={(node) => {
                    pops.current[index] = node
                  }}
                />
                {!readOnly && allowHalf && radio(index + 0.5, true)}
                {!readOnly && radio(index + 1, false)}
              </span>
            )
          })}
        </div>
        {showValue && (
          <span
            className={cn(
              'inline-grid text-sm whitespace-nowrap tabular-nums transition-colors duration-150 ease-standard *:[grid-area:1/1]',
              shown === 0 ? 'text-fg-subtle' : 'text-fg-muted',
              disabled && 'opacity-50',
            )}
          >
            {[0, ...steps].map((next) => (
              <span key={next} aria-hidden="true" className="invisible">
                {textFor(next)}
              </span>
            ))}
            <RollingWords text={textFor(shown)} direction={direction} />
          </span>
        )}
        {!readOnly && (
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
        )}
        {name && <input type="hidden" name={name} value={current} />}
      </div>
    </MotionScope>
  )
}

export { Rating }
export type { RatingProps }
