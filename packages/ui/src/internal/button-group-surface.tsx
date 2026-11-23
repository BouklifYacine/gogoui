import { useCallback, useState } from 'react'
import type { ComponentProps, Ref } from 'react'
import { motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { useGlideHighlight } from './use-glide-highlight.ts'

// The surface: one white control (the outline button's fill and edge),
// its segments bare on it. A segment's own press (Button's .97) shrinks
// its words only, since it has no fill of its own: the neighbours stay.
// A segment given its own `color` keeps its coloured words.
const surface = cn(
  'relative isolate inline-flex w-fit max-w-full items-stretch rounded-parent-button align-middle',
  '[&>:is(button,a)]:relative [&>:is(button,a)]:z-10 [&>:is(button,a)]:rounded-concentric-0.75 [&>:is(button,a)]:bg-transparent [&>:is(button,a)]:shadow-none [&>:is(button,a)]:hover:bg-transparent [&>:is(button,a)]:aria-expanded:bg-transparent',
  '[&>:is(button,a):not([data-color])]:text-inherit [&>:is(button,a):not([data-color])]:hover:text-inherit [&>:is(button,a):not([data-color])]:aria-expanded:text-inherit',
  // The keyboard's outline stays inside the surface, on its segment.
  '[&>:is(button,a)]:focus-visible:outline-offset-[-2px]',
  // Hairline separators, inset from the edges, that step aside where the
  // highlight arrives (data-quiet).
  `[&>:is(button,a)+:is(button,a)]:before:pointer-events-none [&>:is(button,a)+:is(button,a)]:before:absolute [&>:is(button,a)+:is(button,a)]:before:content-[''] [&>:is(button,a)+:is(button,a)]:before:transition-opacity [&>:is(button,a)+:is(button,a)]:before:duration-150 [&>:is(button,a)+:is(button,a)]:before:ease-standard`,
  '[&>[data-quiet]]:before:opacity-0 motion-reduce:[&>:is(button,a)+:is(button,a)]:before:transition-none',
  // Folded to icons when the row does not fit: the words stay for screen
  // readers.
  'data-compact:[&>:is(button,a):has([data-icon=inline-start])]:aspect-square data-compact:[&>:is(button,a):has([data-icon=inline-start])]:px-0 data-compact:[&>:is(button,a):has([data-icon=inline-start])_[data-slot=button-label]]:sr-only',
)

const horizontal =
  '[&>:is(button,a)+:is(button,a)]:before:inset-y-2.5 [&>:is(button,a)+:is(button,a)]:before:-left-px [&>:is(button,a)+:is(button,a)]:before:w-px'
const vertical =
  'flex-col [&>:is(button,a)]:justify-start [&>:is(button,a)+:is(button,a)]:before:inset-x-2.5 [&>:is(button,a)+:is(button,a)]:before:-top-px [&>:is(button,a)+:is(button,a)]:before:h-px'

// Plain: the outline button's white and its separators in the line colour.
const plain =
  'bg-control text-fg shadow-button [&>:is(button,a)+:is(button,a)]:before:bg-line'

// Filled in a colour: its words readable on it, separators and highlight
// drawn from the words' own colour.
const filled: Record<Color, string> = {
  neutral: 'bg-neutral text-neutral-foreground shadow-xs',
  primary: 'bg-primary text-primary-foreground shadow-primary',
  info: 'bg-info text-info-foreground shadow-xs',
  success: 'bg-success text-success-foreground shadow-xs',
  warning: 'bg-warning text-warning-foreground shadow-xs',
  danger: 'bg-danger text-danger-foreground shadow-danger',
}

type ButtonGroupSurfaceProps = ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical' | null
  color?: Color
  collapseLabels?: boolean
}

/**
 * ButtonGroup variant="surface", after Arc UI (https://uiarc.dev, MIT):
 * one surface, hairline separators, and one highlight that glides to the
 * segment pointed at or pressed.
 *
 * @summary Internal: ButtonGroup's surface variant.
 */
export function ButtonGroupSurface({
  className,
  orientation,
  color,
  collapseLabels = true,
  children,
  ref,
  ...props
}: ButtonGroupSurfaceProps) {
  const reduce = useReduceMotion()
  const isVertical = orientation === 'vertical'
  const highlight = useGlideHighlight(reduce)
  const [compact, setCompact] = useState(false)
  const collapsible = collapseLabels && !isVertical

  // Labels fold into icons when the row overflows its container, and come
  // back once the container has room for the whole row again.
  const watchRoom = useCallback(
    (group: HTMLDivElement) => {
      const parent = group.parentElement
      if (!collapsible || !parent || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      let fullWidth = 0
      let blockedAt = 0
      const check = () => {
        const box = getComputedStyle(parent)
        const available =
          parent.clientWidth -
          Number.parseFloat(box.paddingLeft) -
          Number.parseFloat(box.paddingRight)
        if (group.dataset.compact === undefined) {
          const foldable = group.querySelector(
            ':scope > :is(button, a):has([data-icon=inline-start]) [data-slot=button-label]',
          )
          if (foldable && group.scrollWidth > group.clientWidth + 1) {
            fullWidth = group.scrollWidth + 2
            blockedAt = available
            setCompact(true)
          }
        } else if (available > blockedAt && available >= fullWidth) {
          setCompact(false)
        }
      }
      const observer = new ResizeObserver(check)
      observer.observe(group)
      observer.observe(parent)
      return () => observer.disconnect()
    },
    [collapsible],
  )

  const { attach } = highlight
  const setGroup = useCallback(
    (group: HTMLDivElement | null) => {
      setRef(ref, group)
      if (!group) {
        return undefined
      }
      const stopHighlight = attach(group)
      const stopWatching = watchRoom(group)
      return () => {
        stopHighlight?.()
        stopWatching?.()
        setRef(ref, null)
      }
    },
    [attach, watchRoom, ref],
  )

  return (
    <div
      ref={setGroup}
      role="group"
      data-slot="button-group"
      data-variant="surface"
      data-orientation={orientation ?? 'horizontal'}
      data-compact={compact ? '' : undefined}
      className={cn(
        surface,
        isVertical ? vertical : horizontal,
        color
          ? cn(
              filled[color],
              '[&>:is(button,a)+:is(button,a)]:before:bg-current/20',
            )
          : plain,
        className,
      )}
      {...props}
    >
      <motion.span
        aria-hidden="true"
        data-slot="button-group-highlight"
        style={{
          x: highlight.x,
          y: highlight.y,
          width: highlight.width,
          height: highlight.height,
          opacity: highlight.opacity,
        }}
        className={cn(
          'pointer-events-none absolute top-0 left-0 z-0 before:absolute before:inset-0.75 before:rounded-concentric-0.75 before:transition-colors before:duration-150 before:ease-standard data-pressed:before:duration-100',
          color
            ? 'before:bg-current/12 data-pressed:before:bg-current/20'
            : 'before:bg-hover data-pressed:before:bg-selected',
        )}
      />
      {children}
      <span
        data-slot="button-group-status"
        aria-live="polite"
        className="sr-only"
      />
    </div>
  )
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}
