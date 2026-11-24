import { m } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { fill } from './colors.ts'
import type { Color } from './colors.ts'
import { duration, ease, spring } from './motion.ts'

// The tick and the dash share three points, so one morphs into the other
// instead of swapping.
const TICK = 'M4.25 9.25 L7.25 12.25 L13.75 5.75'
const DASH = 'M4.75 9 L9 9 L13.25 9'

// The mark's colour, readable on the fill.
const onFill: Record<Color, string> = {
  neutral: 'text-neutral-foreground',
  primary: 'text-primary-foreground',
  info: 'text-info-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  danger: 'text-danger-foreground',
}

/**
 * A checkbox's fill and its drawn mark, after Arc UI (https://uiarc.dev,
 * MIT): the fill grows from .6 while the tick draws itself; ticked ↔
 * indeterminate morphs the tick into the dash.
 *
 * @summary Internal: the animated fill and tick of Checkbox.
 */
export function CheckboxMark({
  checked,
  indeterminate,
  color = 'primary',
}: {
  checked: boolean
  indeterminate: boolean
  color?: Color
}) {
  const reduce = useReduceMotion()
  const on = checked || indeterminate
  const fade = {
    duration: on ? duration.instant : duration.fast,
    ease: ease.standard,
  }
  const still = { duration: 0 }
  return (
    <>
      <m.span
        aria-hidden="true"
        initial={false}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
        transition={reduce ? still : { scale: spring.snappy, opacity: fade }}
        className={cn('absolute inset-0 rounded-[inherit]', fill[color])}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 18 18"
        fill="none"
        focusable="false"
        className={cn('relative size-full overflow-visible', onFill[color])}
      >
        <m.path
          initial={false}
          animate={{
            d: indeterminate ? DASH : TICK,
            pathLength: on ? 1 : 0,
            opacity: on ? 1 : 0,
          }}
          transition={
            reduce
              ? still
              : { d: spring.morph, pathLength: spring.snappy, opacity: fade }
          }
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  )
}
