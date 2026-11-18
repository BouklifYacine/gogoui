import { MotionConfig, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'

const fill = { type: 'spring', stiffness: 160, damping: 22 } as const
const pop = { type: 'spring', stiffness: 500, damping: 14 } as const

type StepProgressProps = {
  steps: readonly string[]
  /** The current step, counted from 1. */
  current: number
  className?: string
}

/**
 * Where one is in a few steps: a line that fills to the current step, a
 * step done turning green with a tick that draws itself, the current one
 * dark, each step's name under it. Read as « Étape 2 sur 4 : Colonnes ».
 * For a short flow in a dialog, `StepBars` is lighter.
 *
 * @summary Numbered steps on a line that fills.
 */
function StepProgress({ steps, current, className }: StepProgressProps) {
  const { stepOf } = useGoGoUIMessages()
  const last = Math.max(1, steps.length - 1)
  const index = current - 1
  return (
    <MotionConfig reducedMotion="user">
      <div
        data-slot="step-progress"
        className={cn('flex flex-col gap-2.5', className)}
      >
        <p className="sr-only">
          {`${stepOf(current, steps.length)} : ${steps[index] ?? ''}`}
        </p>
        <div aria-hidden="true" className="relative mx-4 h-8">
          <span className="absolute inset-x-0 top-3.5 h-1 rounded-full bg-tray" />
          <motion.span
            className="absolute start-0 top-3.5 h-1 rounded-full bg-success"
            initial={false}
            animate={{ width: `${(index / last) * 100}%` }}
            transition={fill}
          />
          {steps.map((name, step) => {
            const done = step < index
            const here = step === index
            return (
              <motion.span
                key={name}
                initial={false}
                animate={{ scale: here ? [0.7, 1] : 1 }}
                transition={pop}
                style={{ left: `${(step / last) * 100}%` }}
                className={cn(
                  'absolute top-0 -ms-4 flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors duration-300',
                  done && 'bg-success text-white',
                  here && 'bg-inverse text-fg-inverse',
                  !done && !here && 'bg-control text-fg-muted shadow-button',
                )}
              >
                {done ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.12, duration: 0.3 }}
                    />
                  </svg>
                ) : (
                  step + 1
                )}
              </motion.span>
            )
          })}
        </div>
        <div aria-hidden="true" className="relative mx-4 h-4.5">
          {steps.map((name, step) => (
            <span
              key={name}
              style={{ left: `${(step / last) * 100}%` }}
              className={cn(
                'absolute top-0 -translate-x-1/2 text-xs whitespace-nowrap transition-colors duration-300',
                step <= index ? 'text-fg' : 'text-fg-subtle',
              )}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}

export { StepProgress }
export type { StepProgressProps }
