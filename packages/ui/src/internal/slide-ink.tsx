import { AnimatePresence, motion } from 'motion/react'
import type { MotionValue } from 'motion/react'

import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { EASE_OUT } from './slide-motion.ts'
import type { Phase } from './slide-motion.ts'

/** The ink a colour lays, and the words readable on it. */
const inkOf: Record<Color, string> = {
  neutral: 'bg-neutral',
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}
const wordsOf: Record<Color, string> = {
  neutral: 'text-neutral-foreground',
  primary: 'text-primary-foreground',
  info: 'text-info-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  danger: 'text-danger-foreground',
}

/** The ink the thumb leaves behind, its words readable on it; green once done. */
export function SlideInk({
  phase,
  stageLabel,
  color,
  reduceMotion,
  fillClip,
  fillOpacity,
}: {
  phase: Phase
  /** The words on the ink: the label, then the work running, then done. */
  stageLabel: string
  /** The ink's colour; the page's inverse without one. */
  color: Color | undefined
  reduceMotion: boolean | null
  fillClip: MotionValue<string>
  fillOpacity: MotionValue<number>
}) {
  const done = phase === 'done'
  const stage = phase === 'confirming' ? 'busy' : done ? 'done' : 'slide'
  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 transition-colors duration-300 ease-out motion-reduce:transition-none',
        done ? 'bg-success' : color ? inkOf[color] : 'bg-inverse',
      )}
      style={{ clipPath: fillClip, opacity: fillOpacity }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={stage}
          initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE_OUT }
          }
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap',
            done
              ? 'text-success-foreground'
              : color
                ? wordsOf[color]
                : 'text-fg-inverse',
            phase === 'idle' || phase === 'dragging' ? 'pl-6' : 'pr-6',
          )}
        >
          {stageLabel}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
