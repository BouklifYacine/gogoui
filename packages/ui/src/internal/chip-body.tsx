import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { animate, m, useMotionValue, useTransform } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { MotionScope } from './motion-scope.tsx'
import { spring } from './motion.ts'

/** The width the tick takes from the words: a 14px glyph and its gap. */
const SLOT = 18

// A pressed chip's fill and edge, in each colour of the palette.
const tint: Record<Color, string> = {
  neutral: 'bg-neutral-subtle ring-neutral-line',
  primary: 'bg-primary-subtle ring-primary-subtle-stronger',
  info: 'bg-info-subtle ring-info-line',
  success: 'bg-success-subtle ring-success-line',
  warning: 'bg-warning-subtle ring-warning-line',
  danger: 'bg-danger-subtle ring-danger-line',
}

// Its tick, readable on that fill.
const tick: Record<Color, string> = {
  neutral: 'text-neutral-fg',
  primary: 'text-primary-active',
  info: 'text-info-fg',
  success: 'text-success-fg',
  warning: 'text-warning-fg',
  danger: 'text-danger-fg',
}

type ChipBodyProps = {
  pressed: boolean
  color: Color
  size: 'sm' | 'default'
  children: ReactNode
}

/**
 * What a chip of ToggleGroup variant="chips" shows, after Arc UI's chip
 * group (https://uiarc.dev, MIT). Pressing it hands the words' room to a
 * tick in one step, so the row reflows once and its neighbours glide; what
 * you see trails that step on a spring: the fill's edge follows, the words
 * slide over and the tick grows and draws itself in the room they leave.
 * Letting go runs it backwards. Still with reduced motion.
 *
 * @summary Internal: the fill, tick and words of a chip.
 */
export function ChipBody({ pressed, color, size, children }: ChipBodyProps) {
  const reduce = useReduceMotion()
  // How far the visible edge trails the layout edge; it springs back to 0.
  const lag = useMotionValue(0)
  const grown = useMotionValue(pressed ? 1 : 0)
  const edge = useTransform(lag, (value) => -value)
  const tickScale = useTransform(grown, (value) => Math.min(value, 1))
  const tickOpacity = useTransform(grown, (value) => Math.min(1, value * 1.4))
  const tickDraw = useTransform(grown, (value) =>
    Math.min(1, Math.max(0.001, value)),
  )
  const width = useRef<number | null>(null)

  // Runs again each time `pressed` flips, right after the new layout: the
  // width jumps, so the edge starts where it was and springs to its place,
  // keeping its speed when presses come fast.
  const follow = useCallback(
    (body: HTMLSpanElement | null) => {
      if (!body) {
        return undefined
      }
      const next = body.offsetWidth
      const previous = width.current
      width.current = next
      if (reduce) {
        lag.jump(0)
      } else if (previous !== null && previous !== next) {
        const velocity = lag.getVelocity()
        lag.jump(lag.get() + previous - next)
        animate(lag, 0, { ...spring.morph, velocity })
      }
      const slot = pressed ? SLOT : 0
      const grow = () => grown.set(Math.max(0, (slot + lag.get()) / SLOT))
      grow()
      const stop = lag.on('change', grow)
      // A late font or new words only move the baseline.
      const observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => {
              width.current = body.offsetWidth
            })
      observer?.observe(body)
      return () => {
        stop()
        observer?.disconnect()
      }
    },
    [pressed, reduce, lag, grown],
  )

  return (
    <MotionScope>
      <span
        ref={follow}
        className={cn(
          'relative isolate inline-flex min-w-0 items-center transition-[scale] duration-(--motion-spring) ease-spring group-active/chip:scale-[0.97] group-active/chip:duration-(--motion-instant)',
          size === 'sm' ? 'h-7 px-2.5 max-md:h-9' : 'h-8 px-3 max-md:h-10',
        )}
      >
        <m.span
          aria-hidden="true"
          style={{ right: edge }}
          className={cn(
            'absolute inset-y-0 left-0 -z-10 rounded-full ring-1 transition-[background-color,box-shadow] duration-(--motion-fast) ease-standard ring-inset',
            pressed
              ? tint[color]
              : 'bg-surface ring-line group-hover/chip:ring-line-strong',
          )}
        />
        <m.span
          aria-hidden="true"
          style={{ scale: tickScale, opacity: tickOpacity }}
          className={cn(
            'absolute top-1/2 -mt-1.75 grid size-3.5 origin-left place-items-center',
            size === 'sm' ? 'left-2' : 'left-2.5',
            tick[color],
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="block size-3.5 overflow-visible"
          >
            <m.path
              d="M4 12.5 9.5 18 20 6.5"
              style={{ pathLength: tickDraw }}
            />
          </svg>
        </m.span>
        <span
          aria-hidden="true"
          className={cn('shrink-0', pressed ? 'w-4.5' : 'w-0')}
        />
        <m.span style={{ x: lag }} className="truncate">
          {children}
        </m.span>
      </span>
    </MotionScope>
  )
}
