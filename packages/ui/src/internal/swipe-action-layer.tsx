import { m, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import type { Icon } from '@phosphor-icons/react'

import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { ACTION, clamp01 } from './swipe-physics.ts'
import type { Side } from './swipe-physics.ts'

/** An action's fill and the words readable on it. */
const fillOf: Record<Color, string> = {
  neutral: 'bg-neutral text-neutral-foreground',
  primary: 'bg-primary text-primary-foreground',
  info: 'bg-info text-info-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
}

/**
 * One action revealed under a swiped row, after Arc UI (https://uiarc.dev,
 * MIT). Rank 0 sits against the content, the highest rank at the row's
 * outer edge. Every layer spans the whole row and slides in by transform
 * only: the actions share the revealed space, widen together past their
 * resting width, and the chosen one can stretch over the row.
 *
 * The « … » menu is the way for a keyboard or a screen reader, so the
 * layer stays out of the tab order and of the accessibility tree.
 *
 * @summary Internal: an action revealed under a SwipeActionsRow.
 */
export function SwipeActionLayer({
  label,
  icon: ActionIcon,
  color,
  side,
  rank,
  count,
  coverRank,
  x,
  cover,
  onPress,
}: {
  label: string
  icon?: Icon
  color: Color
  side: Side
  rank: number
  count: number
  /** The rank of the action stretching over the row, if any. */
  coverRank: number | null
  x: MotionValue<number>
  cover: MotionValue<number>
  onPress: () => void
}) {
  const direction = side === 'leading' ? 1 : -1
  const segment = useTransform(
    x,
    (value) => Math.max(0, value * direction) / count,
  )
  // From the row's outer edge to this layer's inner edge.
  const inset = useTransform(
    [x, cover],
    ([value = 0, progress = 0]: number[]) => {
      const revealed = Math.max(0, value * direction)
      const base = ((count - rank) * revealed) / count
      if (coverRank === rank) {
        return base + progress * (revealed - base)
      }
      if (coverRank !== null && rank > coverRank) {
        return base * (1 - progress)
      }
      return base
    },
  )
  const shift = useTransform(inset, (value) => direction * value)
  // The glyph rides the middle of its share, then hugs the content's edge
  // while this action covers the row.
  const glyphX = useTransform(
    [segment, cover],
    ([share = 0, progress = 0]: number[]) =>
      coverRank === rank
        ? -direction * (share / 2 + progress * (ACTION / 2 - share / 2))
        : (-direction * share) / 2,
  )
  const iconReveal = useTransform(
    [segment, cover],
    ([share = 0, progress = 0]: number[]) => {
      const own = clamp01((share - ACTION * 0.25) / (ACTION * 0.55))
      if (coverRank === rank) {
        return Math.max(own, progress)
      }
      return coverRank === null ? own : own * (1 - progress)
    },
  )
  const labelReveal = useTransform(
    [segment, cover],
    ([share = 0, progress = 0]: number[]) => {
      const own = clamp01((share - ACTION * 0.72) / (ACTION * 0.24))
      if (coverRank === rank) {
        return Math.max(own, progress)
      }
      return coverRank === null ? own : own * (1 - progress)
    },
  )
  const iconScale = useTransform(iconReveal, (value) => 0.6 + 0.4 * value)

  return (
    <m.button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      data-side={side}
      className={cn(
        'absolute inset-y-0 w-full cursor-pointer border-0 p-0 outline-none [-webkit-tap-highlight-color:transparent]',
        side === 'trailing' ? 'left-full' : 'right-full',
        fillOf[color],
      )}
      style={{ x: shift, zIndex: rank + 1 }}
      onClick={onPress}
    >
      <m.span
        className={cn(
          'absolute inset-y-0 w-0',
          side === 'trailing' ? 'left-0' : 'right-0',
        )}
        style={{ x: glyphX }}
      >
        <span
          className="absolute inset-y-0 flex flex-col items-center justify-center gap-0.75"
          style={{ left: -ACTION / 2, width: ACTION }}
        >
          {ActionIcon && (
            <m.span
              className="grid place-items-center"
              style={{ opacity: iconReveal, scale: iconScale }}
            >
              <ActionIcon aria-hidden="true" className="size-5" />
            </m.span>
          )}
          <m.span
            className="text-xs font-medium whitespace-nowrap"
            style={{ opacity: labelReveal }}
          >
            {label}
          </m.span>
        </span>
      </m.span>
    </m.button>
  )
}
