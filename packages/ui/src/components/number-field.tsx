import { createContext, useContext, useId, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field'
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import type { MotionValue } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './rolling-number.tsx'

/** Words beside the number; a function gets the value (« 1 invité », « 2 invités »). */
type NumberFieldAffix = string | ((value: number) => string)

/** The words NumberField writes, to change on one NumberField only. */
type NumberFieldLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'numberAtMax'
    | 'numberAtMin'
    | 'numberMax'
    | 'numberMin'
    | 'decrease'
    | 'increase'
  >
>

type NumberFieldProps = Omit<
  NumberFieldPrimitive.Root.Props,
  'locale' | 'children' | 'className'
> & {
  /** The field's name for a screen reader when no label points at it. */
  'aria-label'?: string
  /** Its height: sm 32 px, default 36 px, lg 44 px; 44 px on a phone. */
  size?: 'sm' | 'default' | 'lg'
  /** Words before the number. */
  prefix?: NumberFieldAffix
  /** Words after the number: « nuits », or `(n) => n > 1 ? ' invités' : ' invité'`. */
  suffix?: NumberFieldAffix
  /** Says « Max 300 » a moment when a press meets a limit. On by default. */
  limitHint?: boolean
  /** Shown above the field, inside it: a `NumberFieldScrubArea` around its label. */
  children?: ReactNode
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: NumberFieldLabels
}

// Arc UI's number field (https://uiarc.dev, MIT): a press past a limit
// strains the value toward it and springs home, a little further with each
// push in a row; the refused button shakes once.
const PUSH_WINDOW = 700
const PUSH_GAIN = 0.22
const PUSH_CAP = 4
const BUMP_VELOCITY = 130
const LIMIT_HINT_MS = 1500
const UNDER_WARN_MS = 700
// Spring durations as stiffness and damping: a kick keeps its speed.
const physical = (visualDuration: number) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: 'spring' as const, stiffness: root * root, damping: 2 * root }
}
const kick = physical(spring.morph.visualDuration)
/** Travel past a limit gives less and less, never more than `limit` px. */
const rubber = (distance: number, limit = 10) =>
  Math.sign(distance) *
  (1 - 1 / ((Math.abs(distance) * 0.55) / limit + 1)) *
  limit

const affixText = (affix: NumberFieldAffix | undefined, value: number) =>
  typeof affix === 'function' ? affix(value) : (affix ?? '')

/** What the scrub area needs from its field: the value's sideways give. */
const ScrubContext = createContext<{
  scrubX: MotionValue<number>
  atLimit: (toward: 1 | -1) => boolean
  reduce: boolean
} | null>(null)

/**
 * A number with − and + buttons, its digits rolling to each new value.
 *
 * **Use it for** small counts: guests, nights, rooms, a quantity.
 * **Not for** an amount (`MoneyField`) or a big free number (a text field).
 *
 * **Where**: in a form, short width.
 *
 * **States**: default, at min or at max (the button dims; a press there
 * strains the value and says « Min 1 »), typing (the plain text, the
 * digits come back on Enter or blur), past a limit while typing (warning
 * edge), scrubbing, disabled, invalid.
 *
 * **Compose**: alone with a `Label`, or with its label inside:
 * `<NumberField id="guests"><NumberFieldScrubArea><Label htmlFor="guests">
 * Invités</Label></NumberFieldScrubArea></NumberField>`: dragging the label
 * sideways changes the value.
 *
 * **Key props**: `value` / `defaultValue` + `onValueChange`, `min`, `max`,
 * `step`, `largeStep`, `format` (Intl options), `prefix`, `suffix`,
 * `limitHint`, `size` (sm, default, lg), `labels` to change its words.
 *
 * **Accessibility**: a spinbutton (Base UI): arrows, Page up/down,
 * Home/End. A press at a limit is said aloud (« 300, maximum »). Give it a
 * label. With reduced motion the digits change at once and a refused press
 * only tints.
 *
 * @summary A number with − and + buttons, its digits rolling.
 */
function NumberField({
  className,
  id,
  'aria-label': ariaLabel,
  size = 'default',
  prefix,
  suffix,
  limitHint = true,
  children,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  format,
  disabled,
  labels,
  ...props
}: NumberFieldProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const limitId = `${inputId}-limit`

  const [inner, setInner] = useState<number | null>(defaultValue ?? null)
  const current = value === undefined ? inner : value
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [pushed, setPushed] = useState<1 | -1 | 0>(0)
  const [straining, setStraining] = useState<1 | -1 | 0>(0)
  const [underWarn, setUnderWarn] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const bumpY = useMotionValue(0)
  const scrubX = useMotionValue(0)
  const effort = useRef({ edge: 0, count: 0, at: 0 })
  const timers = useRef({ pushed: 0, strain: 0, under: 0 })
  const minusIcon = useRef<HTMLSpanElement>(null)
  const plusIcon = useRef<HTMLSpanElement>(null)

  const numbers = new Intl.NumberFormat(messages.intlLocale, format)
  const spoken = (number: number) =>
    `${affixText(prefix, number)}${numbers.format(number)}${affixText(suffix, number)}`.trim()
  const atLimit = (toward: 1 | -1) =>
    current !== null &&
    (toward > 0
      ? max !== undefined && current >= max
      : min !== undefined && current <= min)

  // Which way the number last moved: the affixes roll that way.
  const shown = current ?? 0
  const [trail, setTrail] = useState({ value: shown, direction: 1 })
  if (trail.value !== shown) {
    setTrail({ value: shown, direction: shown > trail.value ? 1 : -1 })
  }

  /** A press past a limit: the value strains, the button shakes, the note says it. */
  function strain(edge: 1 | -1, fromButton: boolean, now: number) {
    const push = effort.current
    push.count =
      push.edge === edge && now - push.at < PUSH_WINDOW ? push.count + 1 : 1
    push.edge = edge
    push.at = now
    setStraining(edge)
    window.clearTimeout(timers.current.strain)
    timers.current.strain = window.setTimeout(() => setStraining(0), 420)
    if (!reduce) {
      animate(bumpY, 0, {
        ...kick,
        velocity:
          -edge *
          BUMP_VELOCITY *
          (1 + Math.min(push.count - 1, PUSH_CAP) * PUSH_GAIN),
      })
      const icon = (edge > 0 ? plusIcon : minusIcon).current
      if (icon && fromButton) {
        // A physical shake: it keeps its own keyframes.
        animate(
          icon,
          { x: [0, -2.5, 2.5, -1.5, 1, 0] },
          { duration: 0.32, ease: 'easeOut' },
        )
      }
    }
    if (limitHint) {
      setPushed(edge)
      window.clearTimeout(timers.current.pushed)
      timers.current.pushed = window.setTimeout(
        () => setPushed(0),
        LIMIT_HINT_MS,
      )
    }
    if (current !== null) {
      setAnnouncement(
        edge > 0
          ? messages.numberAtMax(spoken(current))
          : messages.numberAtMin(spoken(current)),
      )
    }
  }

  function handleValueChange(
    next: number | null,
    details: NumberFieldPrimitive.Root.ChangeEventDetails,
  ) {
    const typing =
      details.reason === 'input-change' ||
      details.reason === 'input-clear' ||
      details.reason === 'input-paste'
    if (!typing) {
      setEditing(false)
    }
    // A typed number Base UI pulls back to a limit on blur strains there.
    if (details.reason === 'input-blur' && current !== null && next !== null) {
      if (max !== undefined && current > max && next === max) {
        strain(1, false, details.event.timeStamp)
      } else if (min !== undefined && current < min && next === min) {
        strain(-1, false, details.event.timeStamp)
      }
    }
    if (
      (details.reason === 'increment-press' ||
        details.reason === 'decrement-press') &&
      next !== null
    ) {
      setAnnouncement(spoken(next))
    }
    // Under the minimum waits before it warns: « 1 » is often the start of « 12 ».
    window.clearTimeout(timers.current.under)
    setUnderWarn(false)
    if (typing && next !== null && min !== undefined && next < min) {
      timers.current.under = window.setTimeout(
        () => setUnderWarn(true),
        UNDER_WARN_MS,
      )
    }
    if (value === undefined) {
      setInner(next)
    }
    onValueChange?.(next, details)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const up = ['ArrowUp', 'PageUp'].includes(event.key)
    const down = ['ArrowDown', 'PageDown'].includes(event.key)
    if ((up && atLimit(1)) || (down && atLimit(-1))) {
      if (!event.repeat) {
        strain(up ? 1 : -1, true, event.timeStamp)
      }
    } else if (event.key === 'Enter') {
      setEditing(false)
    }
  }

  // A press on a button dimmed at its limit lands on the box under it.
  function onStepperPointerDown(toward: 1 | -1) {
    return (event: PointerEvent<HTMLSpanElement>) => {
      if (event.button === 0 && !disabled && atLimit(toward)) {
        strain(toward, true, event.timeStamp)
      }
    }
  }

  const outside: 1 | -1 | 0 =
    !editing || current === null
      ? 0
      : max !== undefined && current > max
        ? 1
        : min !== undefined && current < min && underWarn
          ? -1
          : 0
  const noteEdge = limitHint ? outside || pushed : 0
  const noteLimit = noteEdge > 0 ? max : min
  const noteText =
    noteEdge === 0 || noteLimit === undefined
      ? ''
      : noteEdge > 0
        ? messages.numberMax(spoken(noteLimit))
        : messages.numberMin(spoken(noteLimit))

  const height = { sm: 'h-8', default: 'h-9', lg: 'h-11 text-base' }[size]
  const width = { sm: 'w-36', default: 'w-40', lg: 'w-48' }[size]
  const stepper =
    'flex size-full items-center justify-center rounded-[calc(var(--radius-button)-3px)] text-fg-muted transition-[background-color,color,opacity] duration-150 ease-standard outline-none hover:bg-hover hover:text-fg active:bg-selected active:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-100 active:[&_svg]:scale-[0.82]'
  const stepperBox =
    'flex aspect-square h-full shrink-0 p-0.5 data-strain:[&_button]:text-warning-fg data-strain:[&_button]:opacity-60'
  const prefixText = affixText(prefix, shown)
  const suffixText = affixText(suffix, shown)
  const affixChars = (text: string) => (
    <AnimatePresence initial={false} custom={trail.direction}>
      {[...text].map((char, index) => (
        <motion.span
          key={`${index}:${char}`}
          className="inline-block overflow-x-clip whitespace-pre"
          initial={
            reduce
              ? { opacity: 0 }
              : { width: 0, opacity: 0, y: `${trail.direction * 0.3}em` }
          }
          animate={{ width: 'auto', opacity: 1, y: 0 }}
          exit={{ width: 0, opacity: 0, transition: { duration: 0 } }}
          transition={
            reduce
              ? { duration: duration.instant }
              : { width: spring.morph, opacity: spring.morph, y: spring.snappy }
          }
        >
          {char}
        </motion.span>
      ))}
    </AnimatePresence>
  )

  return (
    <MotionScope>
      <NumberFieldPrimitive.Root
        data-slot="number-field"
        id={inputId}
        locale={messages.intlLocale}
        value={current}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        format={format}
        disabled={disabled}
        className={cn('grid gap-2', width, className)}
        {...props}
      >
        <ScrubContext value={{ scrubX, atLimit, reduce }}>
          {children}
        </ScrubContext>
        <div className="relative">
          <AnimatePresence initial={false}>
            {noteEdge !== 0 && (
              <motion.span
                key="limit"
                id={limitId}
                className="pointer-events-none absolute right-0 bottom-full mb-2 text-xs font-medium whitespace-nowrap text-warning-fg tabular-nums"
                initial={
                  reduce
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: `${noteEdge * 0.45}em`,
                        filter: `blur(${blur.subtle}px)`,
                      }
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: reduce ? duration.instant : duration.standard,
                    ease: ease.standard,
                  },
                }}
                transition={
                  reduce
                    ? { duration: duration.instant }
                    : { y: spring.snappy, opacity: { duration: duration.fast } }
                }
              >
                {noteText}
              </motion.span>
            )}
          </AnimatePresence>
          <NumberFieldPrimitive.Group
            data-warn={outside !== 0 ? '' : undefined}
            className={cn(
              'flex w-full items-center gap-0.5 overflow-hidden rounded-button bg-field p-0.5 shadow-field ring-1 ring-field-line transition-[box-shadow,background-color] ease-standard ring-inset hover:ring-fg-subtle focus-within:ring-line-focus has-aria-invalid:ring-danger data-disabled:opacity-50 data-scrubbing:ring-line-focus data-warn:bg-warning-subtle data-warn:ring-warning-line',
              height,
              'max-md:h-11',
            )}
          >
            <span
              data-strain={straining < 0 ? '' : undefined}
              className={stepperBox}
              onPointerDown={onStepperPointerDown(-1)}
            >
              <NumberFieldPrimitive.Decrement
                aria-label={messages.decrease}
                className={stepper}
              >
                <span ref={minusIcon} className="grid place-items-center">
                  <GoGoIcon name="minus" aria-hidden="true" />
                </span>
              </NumberFieldPrimitive.Decrement>
            </span>
            <div
              role="presentation"
              className="relative flex h-full min-w-0 flex-1 cursor-text items-center justify-center overflow-hidden"
              onMouseDown={(event) => {
                // A press beside the digits focuses the field without moving it.
                if (!(event.target instanceof HTMLInputElement)) {
                  event.preventDefault()
                  const input = event.currentTarget.querySelector('input')
                  input?.focus()
                  input?.select()
                }
              }}
            >
              <motion.span
                layout={reduce ? false : 'position'}
                transition={spring.morph}
                style={{ x: scrubX, y: bumpY }}
                className={cn(
                  'inline-flex items-center font-medium whitespace-nowrap text-fg tabular-nums transition-colors duration-200',
                  reduce && straining !== 0 && 'text-warning-fg',
                )}
              >
                {prefixText && (
                  <span
                    aria-hidden="true"
                    className="inline-flex font-normal text-fg-muted"
                  >
                    {affixChars(prefixText)}
                  </span>
                )}
                <span className="relative inline-grid items-center">
                  {/* The input only draws the caret and the selection; a
                      span paints the number, rolling or as typed. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'col-start-1 row-start-1 inline-flex',
                      editing && 'invisible absolute top-0 left-0',
                    )}
                  >
                    {current !== null && (
                      <RollingNumber value={current} format={format} />
                    )}
                  </span>
                  {editing && (
                    <span
                      aria-hidden="true"
                      className="col-start-1 row-start-1 whitespace-pre"
                    >
                      {draft}
                    </span>
                  )}
                  <NumberFieldPrimitive.Input
                    aria-label={ariaLabel}
                    aria-describedby={outside !== 0 ? limitId : undefined}
                    onChange={(event) => {
                      setDraft(event.currentTarget.value)
                      setEditing(true)
                    }}
                    onKeyDown={onKeyDown}
                    onBlur={() => setEditing(false)}
                    className="absolute inset-y-0 left-0 z-10 w-[calc(100%+1em)] min-w-4 bg-transparent p-0 text-left text-transparent tabular-nums caret-fg outline-none selection:bg-fg/15 selection:text-transparent disabled:cursor-not-allowed max-md:text-[16px]"
                  />
                </span>
                {suffixText && (
                  <span
                    aria-hidden="true"
                    className="inline-flex font-normal text-fg-muted"
                  >
                    {affixChars(suffixText)}
                  </span>
                )}
              </motion.span>
            </div>
            <span
              data-strain={straining > 0 ? '' : undefined}
              className={stepperBox}
              onPointerDown={onStepperPointerDown(1)}
            >
              <NumberFieldPrimitive.Increment
                aria-label={messages.increase}
                className={stepper}
              >
                <span ref={plusIcon} className="grid place-items-center">
                  <GoGoIcon name="plus" aria-hidden="true" />
                </span>
              </NumberFieldPrimitive.Increment>
            </span>
          </NumberFieldPrimitive.Group>
        </div>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      </NumberFieldPrimitive.Root>
    </MotionScope>
  )
}

/**
 * The label of a `NumberField`, or any words over it, made draggable:
 * sideways, one step every 6 px (Base UI's scrub area). Past a limit the
 * number gives a few pixels and springs back.
 *
 * **Use it for** a value people nudge often (a quantity, a percentage).
 *
 * **Key props**: `pixelSensitivity` (px per step, 6 by default),
 * `direction`.
 *
 * **Accessibility**: a pointer extra; the keyboard keeps the arrows.
 *
 * @summary A number field's label that changes the value when dragged.
 */
function NumberFieldScrubArea({
  className,
  children,
  pixelSensitivity = 6,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props) {
  const scrub = useContext(ScrubContext)

  // Past a limit, the number follows the pointer with resistance.
  function onPointerDown(event: PointerEvent<HTMLSpanElement>) {
    if (!scrub || scrub.reduce || event.button !== 0) {
      return
    }
    let over = 0
    const move = (moved: globalThis.PointerEvent) => {
      const toward = Math.sign(moved.movementX) as 1 | -1 | 0
      if (toward !== 0 && (scrub.atLimit(toward) || over !== 0)) {
        over =
          Math.sign(over + moved.movementX) === Math.sign(over) || over === 0
            ? over + moved.movementX
            : 0
        scrub.scrubX.set(rubber(over))
      }
    }
    const end = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      animate(scrub.scrubX, 0, spring.snappy)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      pixelSensitivity={pixelSensitivity}
      onPointerDown={onPointerDown}
      className={cn(
        'w-fit cursor-ew-resize touch-pan-y select-none data-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
      <NumberFieldPrimitive.ScrubAreaCursor className="flex text-fg drop-shadow-sm [&_svg]:size-3.5">
        <GoGoIcon name="chevronLeft" aria-hidden="true" />
        <GoGoIcon name="chevronRight" aria-hidden="true" />
      </NumberFieldPrimitive.ScrubAreaCursor>
    </NumberFieldPrimitive.ScrubArea>
  )
}

export { NumberField, NumberFieldScrubArea }
export type { NumberFieldAffix, NumberFieldProps, NumberFieldLabels }
