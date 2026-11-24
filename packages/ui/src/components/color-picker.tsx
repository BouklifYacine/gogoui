import { useId, useRef, useState, useSyncExternalStore } from 'react'
import type { ComponentProps, KeyboardEvent, ReactNode } from 'react'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { cva } from 'class-variance-authority'
import { AnimatePresence, animate, m } from 'motion/react'
import { Reorder } from 'motion/react-m'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { ColorChip } from '../internal/color-chip.tsx'
import {
  clamp,
  contrastGrade,
  contrastRatio,
  formatColor,
  formatNames,
  parseColor,
  toCss,
  toHex,
} from '../internal/color-math.ts'
import type { ColorFormat, Hsva } from '../internal/color-math.ts'
import {
  CHECKER,
  ColorPickerContext,
  dragSpring,
  thumbSpring,
  useColorPicker,
} from '../internal/color-picker-context.ts'
import type {
  ColorPickerDrag,
  ColorSwatch,
} from '../internal/color-picker-context.ts'
import { ColorPickerName } from '../internal/color-picker-name.tsx'
import { ColorSlider, stepOf } from '../internal/color-slider.tsx'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { SpringNumber } from '../internal/spring-number.tsx'
import { useColorPad } from '../internal/use-color-pad.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { cn } from '../lib/cn.ts'
import { TextMorph } from './text-morph.tsx'

type ColorPickerProps = {
  /**
   * The colour, when the parent owns it (controlled): hex, rgb(), hsl() or
   * oklch().
   */
  value?: string
  /** The first colour when the picker owns it (uncontrolled); black by default. */
  defaultValue?: string
  /** The new colour, as hex (two more digits when it is not opaque). */
  onValueChange?: (hex: string) => void
  /** The colour's name, shown on the button (« Accent »). */
  label?: string
  /** The button's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  /** The background the colour will sit on: shows the contrast and its WCAG level. */
  contrastWith?: string
  /** The ways the field can write the colour, the first shown first; HEX only by default. */
  formats?: readonly ColorFormat[]
  /** An opacity bar. */
  alpha?: boolean
  /** Saved colours, controlled; uncontrolled from `defaultSwatches` otherwise. */
  swatches?: readonly ColorSwatch[]
  defaultSwatches?: readonly ColorSwatch[]
  onSwatchesChange?: (swatches: ColorSwatch[]) => void
  /** The most saved colours; saving past it drops the oldest. */
  maxSwatches?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The parts; the button and the full panel by default. */
  children?: ReactNode
}

// The panel opens over the button, from its exact box: the button's
// height and padding are the panel head's.
const pill = cva(
  'flex w-max items-center gap-2.5 rounded-full ps-1.5 pe-4 text-start',
  {
    variants: {
      size: {
        sm: 'h-9 [--chip:--spacing(6)]',
        default: 'h-11 [--chip:--spacing(8)]',
        lg: 'h-13 [--chip:--spacing(10)]',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

let swatchCount = 0
const newSwatchId = () => `swatch-${Date.now().toString(36)}-${swatchCount++}`

const subscribeNothing = () => () => {}

type EyeDropperResult = { sRGBHex: string }
type EyeDropperConstructor = new () => { open: () => Promise<EyeDropperResult> }

/**
 * A free colour, picked in a panel that grows out of its swatch, after Arc
 * UI (https://uiarc.dev, MIT): saturation and brightness on an area, hue
 * and opacity on bars whose thumbs follow on a spring, the value typed in
 * HEX, RGB, HSL or OKLCH (the format's name morphs letter by letter), the
 * contrast against a background counted up with its WCAG level, saved
 * colours you can drag, and the screen's eyedropper where the browser has
 * one.
 *
 * **Use it for** a brand colour, a calendar's colour chosen freely.
 * **Prefer** `ColorField` to choose among a few set colours; in a form,
 * `ColorPickerField` (label, help, error).
 *
 * **Where**: in a settings form, a theme editor.
 *
 * **States**: closed (the swatch, the name, the hex), open, dragging (the
 * thumb grows), typed wrong (the field shakes and says why), disabled.
 *
 * **Compose**: `ColorPicker` > `ColorPickerTrigger` + `ColorPickerContent`
 * > `ColorPickerArea`, `ColorPickerHue`, `ColorPickerAlpha`,
 * `ColorPickerInput`, `ColorPickerContrast`, `ColorPickerSwatches`. With no
 * children, the button and every part are there (opacity with `alpha`,
 * contrast with `contrastWith`).
 *
 * **Key props**: `value` + `onValueChange` (hex, controlled) or
 * `defaultValue` (uncontrolled), `label`, `size`, `contrastWith`,
 * `formats`, `alpha`, `swatches` + `onSwatchesChange`, `maxSwatches`,
 * `disabled`.
 *
 * **Accessibility**: the panel opens on the area's thumb; every thumb moves
 * with the arrows (Shift: by ten), Home and End; the area reads both its
 * values in words; Escape closes and gives the focus back to the button;
 * saved colours move with Alt + arrows and leave with Delete; the contrast
 * is read in a sentence; the eyedropper is never the only way.
 *
 * @summary A free colour in a panel that grows out of its swatch.
 */
function ColorPicker({
  value: valueProp,
  defaultValue = '#000000',
  onValueChange,
  label,
  size = 'default',
  disabled = false,
  contrastWith,
  formats = ['hex'],
  alpha = false,
  swatches,
  defaultSwatches = [],
  onSwatchesChange,
  maxSwatches = 7,
  open,
  onOpenChange,
  children,
}: ColorPickerProps) {
  const messages = useGoGoUIMessages()
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  // The picker holds HSV, so a grey keeps the hue it had.
  const [hsva, setHsva] = useState<Hsva>(
    () => parseColor(value) ?? { h: 0, s: 0, v: 0, a: 1 },
  )
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    const next = parseColor(value, hsva.h)
    if (next && toHex(next) !== toHex(hsva)) {
      setHsva(next)
    }
  }
  const [ownSwatches, setOwnSwatches] =
    useState<readonly ColorSwatch[]>(defaultSwatches)
  const [drag, setDrag] = useState<ColorPickerDrag>(null)
  const hex = toHex(hsva)

  return (
    <ColorPickerContext
      value={{
        hsva,
        hex,
        css: toCss(hsva),
        opaque: toCss(hsva, true),
        pure: `hsl(${hsva.h} 100% 50%)`,
        commit: (next) => {
          setHsva(next)
          const nextHex = toHex(next)
          if (nextHex !== hex) {
            setValue(nextHex)
          }
        },
        label: label ?? messages.colorPickerLabel,
        size,
        disabled,
        contrastWith,
        formats: formats.length > 0 ? formats : ['hex'],
        alpha,
        swatches: swatches ?? ownSwatches,
        setSwatches: (next) => {
          if (!swatches) {
            setOwnSwatches(next)
          }
          onSwatchesChange?.(next)
        },
        maxSwatches,
        drag,
        setDrag,
      }}
    >
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => onOpenChange?.(next)}
      >
        {children ?? (
          <>
            <ColorPickerTrigger />
            <ColorPickerContent />
          </>
        )}
      </PopoverPrimitive.Root>
    </ColorPickerContext>
  )
}

/**
 * The button of a ColorPicker: a pill with the swatch, the name and the
 * hex. Give it the field's `id` and `aria-*` in a form.
 *
 * @summary ColorPicker's button: swatch, name, hex.
 */
function ColorPickerTrigger({
  className,
  ...props
}: Omit<PopoverPrimitive.Trigger.Props, 'children'>) {
  const { css, hex, label, size, disabled } = useColorPicker()
  return (
    <PopoverPrimitive.Trigger
      data-slot="color-picker-trigger"
      disabled={disabled}
      className={cn(
        pill({ size }),
        'bg-floating text-fg shadow-xs ring-1 ring-field-line transition-[box-shadow] ease-standard ring-inset hover:ring-fg-subtle focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-danger',
        className,
      )}
      {...props}
    >
      <ColorChip color={css} className="size-(--chip)" />
      <ColorPickerName label={label} hex={hex} />
    </PopoverPrimitive.Trigger>
  )
}

/** The words ColorPickerContent writes, to change on one ColorPickerContent only. */
type ColorPickerContentLabels = Partial<
  Pick<GoGoUIMessages, 'colorPanel' | 'colorEyedropper' | 'confirm'>
>

/**
 * The panel of a ColorPicker. It opens over the button and grows out of
 * its box (a clip that springs from the pill to the panel), its content
 * arriving just behind the growing edge; it shrinks back on closing.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary ColorPicker's panel, grown out of its button.
 */
function ColorPickerContent({
  className,
  children,
  labels,
}: {
  className?: string
  children?: ReactNode
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ColorPickerContentLabels
}) {
  const state = useColorPicker()
  const messages = useGoGoUIMessages(labels)
  const popup = useRef<HTMLDivElement>(null)
  const canPick = useSyncExternalStore(
    subscribeNothing,
    () => 'EyeDropper' in window,
    () => false,
  )

  function pickFromScreen() {
    const EyeDropper = (
      window as unknown as { EyeDropper?: EyeDropperConstructor }
    ).EyeDropper
    if (!EyeDropper) {
      return
    }
    new EyeDropper()
      .open()
      .then((result) => {
        const next = parseColor(result.sRGBHex, state.hsva.h)
        if (next) {
          state.commit({ ...next, a: state.hsva.a })
        }
      })
      // Escape in the eyedropper: nothing changes.
      .catch(() => {})
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side="bottom"
        align="start"
        // Over the button: the panel's head lies on it.
        sideOffset={({ anchor }) => -anchor.height}
        collisionPadding={8}
        collisionAvoidance={{
          side: 'shift',
          align: 'shift',
          fallbackAxisSide: 'none',
        }}
        // The shadow is on the layer under the clip, so it follows it.
        className="isolate z-50 drop-shadow-xl"
      >
        <PopoverPrimitive.Popup
          ref={popup}
          data-slot="color-picker-content"
          aria-label={messages.colorPanel(state.label)}
          initialFocus={() =>
            popup.current?.querySelector<HTMLElement>(
              "[data-slot='color-picker-area'] [role='slider']",
            ) ?? true
          }
          className={cn(
            'group/color-panel w-[min(19rem,calc(100vw-2rem))] rounded-3xl bg-floating pb-3.5 text-fg shadow-[inset_0_0_0_1px_var(--line)] outline-none',
            '[clip-path:inset(0_0_0_0_round_1.5rem)] [transition:clip-path_var(--motion-spring)_var(--motion-ease-spring)]',
            // On the way in and out, the clip is the button's own box.
            'data-starting-style:[clip-path:inset(0_calc(100%-var(--anchor-width))_calc(100%-var(--anchor-height))_0_round_calc(var(--anchor-height)/2))]',
            'data-ending-style:[clip-path:inset(0_calc(100%-var(--anchor-width))_calc(100%-var(--anchor-height))_0_round_calc(var(--anchor-height)/2))]',
            'data-ending-style:opacity-0 data-ending-style:[transition:clip-path_var(--motion-standard)_var(--motion-ease-standard),opacity_var(--motion-instant)_var(--motion-ease-standard)_var(--motion-fast)]',
            className,
          )}
        >
          <div className={cn(pill({ size: state.size }), 'w-full pe-1.5')}>
            <ColorChip color={state.css} className="size-(--chip)" />
            <span className="flex min-w-0 flex-1">
              <ColorPickerName label={state.label} hex={state.hex} />
            </span>
            <span className="flex gap-0.5 transition-opacity delay-75 duration-(--motion-standard) ease-enter group-data-ending-style/color-panel:opacity-0 group-data-ending-style/color-panel:delay-0 group-data-starting-style/color-panel:opacity-0">
              {canPick && (
                <button
                  type="button"
                  aria-label={messages.colorEyedropper}
                  className={iconButton}
                  onClick={pickFromScreen}
                >
                  <GoGoIcon
                    name="eyedropper"
                    aria-hidden="true"
                    className="size-4.5"
                  />
                </button>
              )}
              <PopoverPrimitive.Close
                aria-label={messages.confirm}
                className={iconButton}
              >
                <GoGoIcon
                  name="check"
                  aria-hidden="true"
                  className="size-4.5"
                />
              </PopoverPrimitive.Close>
            </span>
          </div>
          {/* The content arrives behind the growing edge, and leaves first. */}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5 px-3.5 pt-2 transition-[opacity,translate] delay-[90ms] duration-(--motion-standard) ease-enter group-data-ending-style/color-panel:-translate-y-1 group-data-ending-style/color-panel:opacity-0 group-data-ending-style/color-panel:delay-0 group-data-ending-style/color-panel:duration-(--motion-instant) group-data-starting-style/color-panel:-translate-y-2.5 group-data-starting-style/color-panel:opacity-0">
            {children ?? (
              <>
                <ColorPickerArea />
                <ColorPickerHue />
                {state.alpha && <ColorPickerAlpha />}
                <ColorPickerInput />
                {state.contrastWith && <ColorPickerContrast />}
                <ColorPickerSwatches />
              </>
            )}
          </div>
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

const iconButton =
  'grid size-8 place-items-center rounded-xl text-fg-muted transition-[background-color,color,scale] duration-(--motion-fast) ease-standard hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-96 motion-reduce:transition-none'

/** The words ColorPickerArea writes, to change on one ColorPickerArea only. */
type ColorPickerAreaLabels = Partial<
  Pick<GoGoUIMessages, 'colorArea' | 'colorAreaRole' | 'colorAreaValue'>
>

/**
 * Saturation (across) and brightness (up) over the pure hue. A click sends
 * the thumb on a quick spring, a drag keeps it under the finger.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary ColorPicker's saturation and brightness area.
 */
function ColorPickerArea({
  className,
  labels,
}: {
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ColorPickerAreaLabels
}) {
  const { hsva, commit, pure, opaque, drag, setDrag, disabled } =
    useColorPicker()
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const pad = useColorPad(
    (x, y) => commit({ ...hsva, s: x, v: 1 - y }),
    (on) => setDrag(on ? 'area' : null),
  )
  const dragging = drag === 'area'
  const saturation = Math.round(hsva.s * 100)
  const brightness = Math.round(hsva.v * 100)
  return (
    <div
      data-slot="color-picker-area"
      className={cn(
        'relative h-41 cursor-crosshair touch-none rounded-2xl shadow-[inset_0_0_0_1px_var(--line)]',
        className,
      )}
      // Colour maths, not a theme: black to the bottom, white to the left,
      // over the hue.
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${pure}`,
      }}
      {...(disabled ? {} : pad)}
    >
      <MotionScope>
        <m.div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={messages.colorArea}
          aria-roledescription={messages.colorAreaRole}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={saturation}
          aria-valuetext={messages.colorAreaValue(saturation, brightness)}
          aria-disabled={disabled || undefined}
          data-dragging={dragging || undefined}
          className={cn(
            'absolute size-5.5 -translate-1/2 cursor-grab rounded-full',
            'shadow-[0_0_0_3px_white,0_2px_8px_rgb(0_0_0/0.3),inset_0_0_0_1px_rgb(0_0_0/0.12)]',
            'transition-[scale] duration-(--motion-spring) ease-spring motion-reduce:transition-none data-dragging:scale-120 data-dragging:cursor-grabbing',
            'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus',
          )}
          style={{ backgroundColor: opaque }}
          initial={false}
          animate={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%` }}
          transition={
            reduce ? { duration: 0 } : dragging ? dragSpring : thumbSpring
          }
          onKeyDown={(event) => {
            const step = stepOf(event, 100)
            if (step === null || disabled) {
              return
            }
            event.preventDefault()
            const across =
              event.key === 'ArrowLeft' || event.key === 'ArrowRight'
            commit(
              across
                ? { ...hsva, s: clamp(hsva.s + step / 100) }
                : { ...hsva, v: clamp(hsva.v + step / 100) },
            )
          }}
        />
      </MotionScope>
    </div>
  )
}

const HUE_TRACK =
  'linear-gradient(to right, #f00 11px, #ff0 calc(11px + (100% - 22px) * .1666), #0f0 calc(11px + (100% - 22px) * .3333), #0ff 50%, #00f calc(11px + (100% - 22px) * .6666), #f0f calc(11px + (100% - 22px) * .8333), #f00 calc(100% - 11px))'

/** The words ColorPickerHue writes, to change on one ColorPickerHue only. */
type ColorPickerHueLabels = Partial<
  Pick<GoGoUIMessages, 'colorHue' | 'colorHueValue'>
>

/**
 * The hue bar, red to red.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary ColorPicker's hue bar.
 */
function ColorPickerHue({
  labels,
}: {
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ColorPickerHueLabels
}) {
  const { hsva, commit, pure, drag, setDrag, disabled } = useColorPicker()
  const messages = useGoGoUIMessages(labels)
  return (
    <MotionScope>
      <ColorSlider
        slot="color-picker-hue"
        label={messages.colorHue}
        value={hsva.h}
        max={360}
        valueText={messages.colorHueValue(Math.round(hsva.h))}
        onChange={(h) => commit({ ...hsva, h: clamp(h, 0, 359.9) })}
        track={HUE_TRACK}
        thumb={pure}
        dragging={drag === 'hue'}
        onDrag={(on) => setDrag(on ? 'hue' : null)}
        disabled={disabled}
      />
    </MotionScope>
  )
}

/** The words ColorPickerAlpha writes, to change on one ColorPickerAlpha only. */
type ColorPickerAlphaLabels = Partial<Pick<GoGoUIMessages, 'colorOpacity'>>

/**
 * The opacity bar, see-through to solid over a checkerboard.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary ColorPicker's opacity bar.
 */
function ColorPickerAlpha({
  labels,
}: {
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ColorPickerAlphaLabels
}) {
  const { hsva, commit, css, opaque, drag, setDrag, disabled } =
    useColorPicker()
  const messages = useGoGoUIMessages(labels)
  return (
    <MotionScope>
      <ColorSlider
        slot="color-picker-alpha"
        label={messages.colorOpacity}
        value={hsva.a * 100}
        max={100}
        valueText={`${Math.round(hsva.a * 100)} %`}
        onChange={(a) => commit({ ...hsva, a: clamp(a / 100) })}
        track={`linear-gradient(to right, transparent 11px, ${opaque} calc(100% - 11px)), ${CHECKER}`}
        thumb={css}
        dragging={drag === 'alpha'}
        onDrag={(on) => setDrag(on ? 'alpha' : null)}
        disabled={disabled}
      />
    </MotionScope>
  )
}

/** The words ColorPickerInput writes, to change on one ColorPickerInput only. */
type ColorPickerInputLabels = Partial<
  Pick<GoGoUIMessages, 'colorFormat' | 'colorIn' | 'colorInvalid'>
>

/**
 * The colour typed by hand. With several `formats`, a button before it
 * cycles HEX, RGB, HSL, OKLCH, its name and the value morphing letter by
 * letter. Enter or leaving the field reads it; a colour it cannot read
 * shakes the field and says why.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary ColorPicker's typed value, with its format.
 */
function ColorPickerInput({
  className,
  labels,
}: {
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ColorPickerInputLabels
}) {
  const { hsva, commit, label, formats, disabled } = useColorPicker()
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const errorId = useId()
  const [format, setFormat] = useState<ColorFormat>(formats[0] ?? 'hex')
  const [draft, setDraft] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)
  // While the format changes, the old text morphs into the new one over
  // the field, which shows again once it settles.
  const [morph, setMorph] = useState<string | null>(null)
  const settle = useRef<number | undefined>(undefined)
  const field = useRef<HTMLDivElement>(null)
  const text = formatColor(hsva, format)

  function cycle() {
    const next =
      formats[(formats.indexOf(format) + 1) % formats.length] ?? 'hex'
    setFormat(next)
    setDraft(null)
    setInvalid(false)
    if (reduce) {
      return
    }
    const to = formatColor(hsva, next)
    setMorph(text)
    requestAnimationFrame(() => setMorph(to))
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => setMorph(null), 620)
  }

  function read(): boolean {
    if (draft === null) {
      return true
    }
    const next = parseColor(draft, hsva.h)
    if (!next) {
      setInvalid(true)
      if (!reduce && field.current) {
        animate(
          field.current,
          { x: [0, -5, 4, -2, 0] },
          { duration: 0.32, ease: ease.standard },
        )
      }
      return false
    }
    commit(next)
    setDraft(null)
    setInvalid(false)
    return true
  }

  const formatLabel = (
    <MotionScope>
      <TextMorph>{formatNames[format]}</TextMorph>
    </MotionScope>
  )

  return (
    <div className={cn('grid gap-1.5', className)}>
      <div
        ref={field}
        data-invalid={invalid || undefined}
        className="flex h-10 items-stretch overflow-hidden rounded-xl bg-field ring-1 ring-field-line transition-[box-shadow] ease-standard ring-inset focus-within:ring-line-focus hover:ring-fg-subtle data-invalid:ring-danger"
      >
        {formats.length > 1 ? (
          <button
            type="button"
            disabled={disabled}
            aria-label={messages.colorFormat(formatNames[format])}
            className="flex min-w-14 items-center justify-center border-e border-field-line px-2.5 text-xs font-medium transition-colors duration-(--motion-fast) ease-standard hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus"
            onClick={cycle}
          >
            {formatLabel}
          </button>
        ) : (
          <span className="flex min-w-14 items-center justify-center border-e border-field-line px-2.5 text-xs font-medium">
            {formatNames[format]}
          </span>
        )}
        <span className="relative flex min-w-0 flex-1">
          <input
            value={draft ?? text}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            aria-label={messages.colorIn(label, formatNames[format])}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            data-morphing={morph !== null || undefined}
            className="w-full min-w-0 bg-transparent px-2.5 text-xs text-fg tabular-nums caret-fg outline-none data-morphing:text-transparent max-md:text-[16px]"
            onChange={(event) => {
              setDraft(event.target.value)
              setInvalid(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (read()) {
                  event.currentTarget.select()
                }
              }
              // Escape first drops what is typed; a second one closes.
              if (event.key === 'Escape' && draft !== null) {
                event.stopPropagation()
                setDraft(null)
                setInvalid(false)
              }
            }}
            onBlur={() => {
              if (!read()) {
                setDraft(null)
              }
            }}
          />
          {morph !== null && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-2.5 text-xs whitespace-nowrap tabular-nums max-md:text-[16px]"
            >
              <MotionScope>
                <TextMorph>{morph}</TextMorph>
              </MotionScope>
            </span>
          )}
        </span>
      </div>
      <p
        id={errorId}
        aria-live="polite"
        className="text-xs text-danger-fg empty:hidden"
      >
        {invalid ? messages.colorInvalid : ''}
      </p>
    </div>
  )
}

const gradeLook = {
  AAA: 'bg-success-subtle text-success-fg',
  AA: 'bg-success-subtle text-success-fg',
  'AA large': 'bg-warning-subtle text-warning-fg',
  fail: 'bg-danger-subtle text-danger-fg',
} as const

/** The words ColorPickerContrast writes, to change on one ColorPickerContrast only. */
type ColorPickerContrastLabels = Partial<
  Pick<GoGoUIMessages, 'colorContrastWith' | 'contrastGrade' | 'contrastRead'>
>

/**
 * The contrast of the colour against `contrastWith`: a sample, the ratio
 * counted up on a spring, and the WCAG level that rolls when it changes.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary ColorPicker's contrast readout.
 */
function ColorPickerContrast({
  className,
  labels,
}: {
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ColorPickerContrastLabels
}) {
  const { hsva, css, contrastWith } = useColorPicker()
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const background = contrastWith ?? '#ffffff'
  const ratio = contrastRatio(hsva, parseColor(background))
  const grade = contrastGrade(ratio)
  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, y: '0.3em', filter: `blur(${blur.subtle}px)` }
  return (
    <div className={cn('flex items-center gap-2.5 text-sm', className)}>
      <span
        aria-hidden="true"
        className="grid h-7 w-9 shrink-0 place-items-center rounded-lg font-medium shadow-[inset_0_0_0_1px_var(--line)]"
        style={{ background, color: css }}
      >
        Aa
      </span>
      <span
        aria-hidden="true"
        className="min-w-[4.4ch] font-medium tabular-nums"
      >
        <SpringNumber value={ratio} />
        :1
      </span>
      <span
        aria-hidden="true"
        className="min-w-0 flex-1 truncate text-xs text-fg-muted max-[22rem]:hidden"
      >
        {messages.colorContrastWith}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'inline-grid h-5.5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap transition-[background-color,color] duration-(--motion-standard) ease-standard',
          gradeLook[grade],
        )}
      >
        <MotionScope>
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={grade}
              initial={hidden}
              animate={{ opacity: 1, y: '0em', filter: 'blur(0px)' }}
              exit={{ ...hidden, transition: { duration: duration.instant } }}
              transition={
                reduce
                  ? { duration: duration.instant }
                  : { duration: duration.standard, ease: ease.enter }
              }
            >
              {messages.contrastGrade(grade)}
            </m.span>
          </AnimatePresence>
        </MotionScope>
      </span>
      <span className="sr-only">
        {messages.contrastRead(
          ratio.toFixed(2),
          messages.contrastGrade(grade),
          grade !== 'fail',
        )}
      </span>
    </div>
  )
}

/** The words ColorPickerSwatches writes, to change on one ColorPickerSwatches only. */
type ColorPickerSwatchesLabels = Partial<
  Pick<GoGoUIMessages, 'colorSave' | 'colorSaved' | 'colorSwatch'>
>

/**
 * Saved colours: « + » saves the current one first in line; a click
 * applies one; they can be dragged, moved with Alt + arrows, removed with
 * Delete.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary ColorPicker's saved colours.
 */
function ColorPickerSwatches({
  className,
  labels,
}: {
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ColorPickerSwatchesLabels
}) {
  const { hex, hsva, commit, swatches, setSwatches, maxSwatches, disabled } =
    useColorPicker()
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const [focusId, setFocusId] = useState<string | null>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const dragged = useRef(false)
  const tabStop = swatches.some((swatch) => swatch.id === focusId)
    ? focusId
    : swatches[0]?.id

  function focusSoon(id: string) {
    requestAnimationFrame(() =>
      buttons.current.get(id)?.focus({ preventScroll: true }),
    )
  }

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const swatch = swatches[index]
    if (!swatch) {
      return
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      const next = swatches.filter((entry) => entry.id !== swatch.id)
      setSwatches(next)
      const neighbour = next[Math.min(index, next.length - 1)]
      setFocusId(neighbour?.id ?? null)
      if (neighbour) {
        focusSoon(neighbour.id)
      }
      return
    }
    const move =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!move && event.key !== 'Home' && event.key !== 'End') {
      return
    }
    event.preventDefault()
    if (move && event.altKey) {
      const to = index + move
      if (to < 0 || to >= swatches.length) {
        return
      }
      const next = [...swatches]
      next.splice(index, 1)
      next.splice(to, 0, swatch)
      setSwatches(next)
      focusSoon(swatch.id)
      return
    }
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? swatches.length - 1
          : (index + move + swatches.length) % swatches.length
    const id = swatches[target]?.id
    if (id) {
      setFocusId(id)
      buttons.current.get(id)?.focus({ preventScroll: true })
    }
  }

  return (
    <div className={cn('flex min-h-8 items-center gap-1.5', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-label={messages.colorSave(hex)}
        className="grid size-7.5 shrink-0 place-items-center rounded-full border border-dashed border-line-strong text-fg-muted transition-[color,border-color,scale] duration-(--motion-fast) ease-standard hover:border-fg hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-96 motion-reduce:transition-none"
        onClick={() => {
          const entry = { id: newSwatchId(), color: hex }
          setSwatches([entry, ...swatches].slice(0, maxSwatches))
          setFocusId(entry.id)
        }}
      >
        <GoGoIcon name="plus" aria-hidden="true" className="size-4" />
      </button>
      <MotionScope>
        <Reorder.Group
          as="div"
          axis="x"
          values={[...swatches]}
          onReorder={setSwatches}
          role="listbox"
          aria-label={messages.colorSaved}
          aria-orientation="horizontal"
          className="flex min-w-0 flex-1 gap-1.5"
        >
          <AnimatePresence initial={false}>
            {swatches.map((swatch, index) => {
              const current = swatch.color.toUpperCase() === hex
              return (
                <Reorder.Item
                  key={swatch.id}
                  value={swatch}
                  as="div"
                  dragListener={!disabled}
                  dragElastic={0.12}
                  className="relative shrink-0 touch-pan-y"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          scale: 0.4,
                          transition: { duration: duration.fast },
                        }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { ...spring.snappy, layout: spring.smooth }
                  }
                  whileDrag={reduce ? undefined : { scale: 1.15, zIndex: 2 }}
                  onDragStart={() => {
                    dragged.current = true
                  }}
                  onDragEnd={() =>
                    requestAnimationFrame(() => {
                      dragged.current = false
                    })
                  }
                >
                  <button
                    ref={(node) => {
                      if (node) {
                        buttons.current.set(swatch.id, node)
                      } else {
                        buttons.current.delete(swatch.id)
                      }
                    }}
                    type="button"
                    role="option"
                    disabled={disabled}
                    aria-selected={current}
                    aria-label={messages.colorSwatch(swatch.color)}
                    data-current={current || undefined}
                    tabIndex={swatch.id === tabStop ? 0 : -1}
                    className="group/swatch grid size-7.5 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus data-current:shadow-[inset_0_0_0_2px_var(--fg)]"
                    onFocus={() => setFocusId(swatch.id)}
                    onKeyDown={(event) => onKey(event, index)}
                    onClick={() => {
                      if (dragged.current) {
                        return
                      }
                      const next = parseColor(swatch.color, hsva.h)
                      if (next) {
                        commit(next)
                      }
                    }}
                  >
                    <ColorChip
                      color={swatch.color}
                      className="size-6.5 transition-[scale] duration-(--motion-spring) ease-spring group-data-current/swatch:scale-78 motion-reduce:transition-none"
                    />
                  </button>
                </Reorder.Item>
              )
            })}
          </AnimatePresence>
        </Reorder.Group>
      </MotionScope>
    </div>
  )
}

export {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerContrast,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerSwatches,
  ColorPickerTrigger,
}
export type {
  ColorFormat,
  ColorPickerProps,
  ColorSwatch,
  ColorPickerContentLabels,
  ColorPickerAreaLabels,
  ColorPickerHueLabels,
  ColorPickerAlphaLabels,
  ColorPickerInputLabels,
  ColorPickerContrastLabels,
  ColorPickerSwatchesLabels,
}
export type ColorPickerTriggerProps = ComponentProps<typeof ColorPickerTrigger>
