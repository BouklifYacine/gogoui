import { motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { fill } from './colors.ts'
import type { Color } from './colors.ts'
import { GoGoIcon } from './gogo-icon.tsx'
import { spring } from './motion.ts'

/** The tick's colour on its filled dot. */
const tickOn: Record<Color, string> = {
  neutral: 'text-neutral-foreground',
  primary: 'text-primary-foreground',
  info: 'text-info-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  danger: 'text-danger-foreground',
}

/**
 * One kind filter of ChangelogFeed, after Arc UI (https://uiarc.dev, MIT):
 * a pill whose 7 px dot grows into a 16 px tick when it is pressed. A
 * toggle button (`aria-pressed`); still with reduced motion.
 *
 * @summary Internal: a changelog's kind filter, its dot turning into a tick.
 */
export function ChangelogChip({
  label,
  count,
  color,
  pressed,
  onPressedChange,
}: {
  label: string
  count: number
  color: Color
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
}) {
  const reduce = useReduceMotion()
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className="group/chip inline-flex h-9 items-center gap-2 rounded-full pr-3.5 pl-3 text-sm font-medium text-fg-muted ring-1 ring-line ring-inset transition-[background-color,color,box-shadow,scale] duration-(--motion-standard) ease-standard outline-none not-aria-pressed:hover:text-fg not-aria-pressed:hover:ring-line-strong focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-solid active:scale-[0.97] active:duration-(--motion-instant) aria-pressed:bg-inverse aria-pressed:text-fg-inverse aria-pressed:ring-inverse motion-reduce:active:scale-100 max-md:h-11"
    >
      <motion.span
        aria-hidden="true"
        className={cn(
          'grid shrink-0 place-items-center overflow-hidden rounded-full',
          fill[color],
        )}
        initial={false}
        animate={{ width: pressed ? 16 : 7, height: pressed ? 16 : 7 }}
        transition={reduce ? { duration: 0 } : spring.morph}
      >
        <motion.span
          className={cn('grid place-items-center', tickOn[color])}
          initial={false}
          animate={{ opacity: pressed ? 1 : 0, scale: pressed ? 1 : 0.7 }}
          transition={
            reduce
              ? { duration: 0 }
              : { ...spring.snappy, delay: pressed ? 0.05 : 0 }
          }
        >
          <GoGoIcon name="check" weight="bold" className="size-2.5" />
        </motion.span>
      </motion.span>
      <span>{label}</span>
      <span className="text-xs text-fg-subtle tabular-nums transition-colors duration-(--motion-standard) group-aria-pressed/chip:text-fg-inverse/65">
        {count}
      </span>
    </button>
  )
}
