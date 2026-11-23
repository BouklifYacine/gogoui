import type { CSSProperties, KeyboardEvent } from 'react'
import { motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { clamp } from './color-math.ts'
import { CHECKER, dragSpring, thumbSpring } from './color-picker-context.ts'
import { useColorPad } from './use-color-pad.ts'

/** Arrows step by one, Shift or Page keys by ten, Home and End to the ends. */
export function stepOf(event: KeyboardEvent, max: number): number | null {
  const big = event.shiftKey || event.key.startsWith('Page') ? 10 : 1
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
    case 'PageUp':
      return big
    case 'ArrowLeft':
    case 'ArrowDown':
    case 'PageDown':
      return -big
    case 'Home':
      return -max
    case 'End':
      return max
    default:
      return null
  }
}

/**
 * A colour bar with its thumb, after Arc UI (https://uiarc.dev, MIT): a
 * click sends the thumb on a quick spring, a drag keeps it glued to the
 * finger, and it grows a little while held. The thumb is the slider for
 * assistive technology.
 *
 * @summary Internal: ColorPicker's hue and opacity bars.
 */
export function ColorSlider({
  slot,
  label,
  value,
  max,
  valueText,
  onChange,
  track,
  thumb,
  dragging,
  onDrag,
  disabled,
}: {
  slot: string
  label: string
  value: number
  max: number
  valueText: string
  onChange: (value: number) => void
  /** The bar's CSS background. */
  track: string
  /** The thumb's colour, laid over a checkerboard. */
  thumb: string
  dragging: boolean
  onDrag: (dragging: boolean) => void
  disabled: boolean
}) {
  const reduce = useReduceMotion()
  const pad = useColorPad((x) => onChange(x * max), onDrag)
  return (
    <div
      data-slot={slot}
      // The thumb's centre travels 11px in from each end, where the bar's
      // colour matches the value it reports.
      className="relative mx-[11px] h-3.5 cursor-pointer touch-none rounded-full before:absolute before:inset-y-0 before:-inset-x-[11px] before:rounded-full before:[background:var(--track)] before:shadow-[inset_0_0_0_1px_var(--line)]"
      style={{ '--track': track } as CSSProperties}
      {...(disabled ? {} : pad)}
    >
      <motion.div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        aria-valuetext={valueText}
        aria-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        className={cn(
          'absolute top-1/2 size-5.5 -translate-1/2 cursor-grab rounded-full',
          'shadow-[0_0_0_3px_white,0_2px_8px_rgb(0_0_0/0.3),inset_0_0_0_1px_rgb(0_0_0/0.12)]',
          'transition-[scale] duration-(--motion-spring) ease-spring motion-reduce:transition-none data-dragging:scale-120 data-dragging:cursor-grabbing',
          'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus',
        )}
        style={{
          background: `linear-gradient(${thumb}, ${thumb}), ${CHECKER}`,
        }}
        initial={false}
        animate={{ left: `${(value / max) * 100}%` }}
        transition={
          reduce ? { duration: 0 } : dragging ? dragSpring : thumbSpring
        }
        onKeyDown={(event) => {
          const step = stepOf(event, max)
          if (step === null || disabled) {
            return
          }
          event.preventDefault()
          onChange(clamp(value + step, 0, max))
        }}
      />
    </div>
  )
}
