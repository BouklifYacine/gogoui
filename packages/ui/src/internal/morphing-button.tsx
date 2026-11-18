import { useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { CheckIcon } from '@phosphor-icons/react'

import { Button } from '../components/button.tsx'
import { Spinner } from '../components/spinner.tsx'
import { cn } from '../lib/cn.ts'
import { useElementSize } from './use-element-size.ts'

// How long « Enregistré » stays before the button reads as before.
const SAVED_MS = 2000

const morph = { type: 'spring', stiffness: 300, damping: 22 } as const
const rise = { type: 'spring', stiffness: 220, damping: 20 } as const

/**
 * The submit button closes into a turning circle while the form submits,
 * then opens into a green « Enregistré » whose tick draws itself, then
 * reads as before.
 */
export function MorphingButton({
  children,
  submitting,
  saved,
  savedText,
  variant,
}: {
  children: ReactNode
  submitting: boolean
  saved: boolean
  savedText: string
  variant: ComponentProps<typeof Button>['variant']
}) {
  // « Enregistré » shows a moment after each new success, then goes.
  const [seenSaved, setSeenSaved] = useState(saved)
  const [showSaved, setShowSaved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  if (saved !== seenSaved) {
    setSeenSaved(saved)
    if (saved) {
      setShowSaved(true)
    }
  }

  const phase = submitting ? 'busy' : showSaved ? 'saved' : 'idle'

  // At rest the button has its own width. Busy, it springs to a circle;
  // saved, to the width of « Enregistré », measured on a hidden copy.
  const [savedSize, measureSaved] = useElementSize<HTMLSpanElement>()
  const [busySize, measureBusy] = useElementSize<HTMLSpanElement>()
  const width =
    (phase === 'busy'
      ? busySize?.height
      : phase === 'saved'
        ? savedSize?.width
        : undefined) ?? 'auto'

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={false}
        animate={{ width }}
        transition={morph}
        className="relative inline-flex h-9 max-w-full shrink-0 max-md:h-11"
      >
        <span
          ref={measureSaved}
          aria-hidden="true"
          className="invisible absolute flex w-max items-center gap-2 px-4 text-sm font-medium"
        >
          <CheckIcon className="size-4" />
          {savedText}
        </span>
        <span
          ref={measureBusy}
          aria-hidden="true"
          className="invisible absolute h-9 w-px max-md:h-11"
        />

        <Button
          type="submit"
          variant={variant}
          // Busy, the button keeps the focus; only the click is blocked.
          disabled={submitting}
          focusableWhenDisabled
          aria-busy={submitting || undefined}
          className={cn(
            'relative h-full w-full overflow-hidden px-0 transition-[color,background-color,box-shadow,scale,border-radius] aria-busy:opacity-100',
            phase !== 'idle' && 'rounded-full',
            phase === 'saved' &&
              'bg-success text-white shadow-none hover:bg-success',
          )}
        >
          <motion.span
            className="flex items-center justify-center gap-2 px-4 whitespace-nowrap"
            initial={false}
            animate={
              phase === 'idle' ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
            }
            transition={rise}
          >
            {children}
          </motion.span>
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={
              phase === 'busy'
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.6 }
            }
            transition={rise}
          >
            <Spinner className="size-4.5" />
          </motion.span>
          <motion.span
            aria-hidden={phase !== 'saved'}
            className="absolute inset-0 flex items-center justify-center gap-2 px-4 whitespace-nowrap"
            initial={false}
            animate={
              phase === 'saved' ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
            }
            transition={rise}
            onAnimationComplete={() => {
              if (phase === 'saved') {
                clearTimeout(timer.current)
                timer.current = setTimeout(() => setShowSaved(false), SAVED_MS)
              }
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                initial={false}
                animate={{ pathLength: phase === 'saved' ? 1 : 0 }}
                transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
              />
            </svg>
            {savedText}
          </motion.span>
        </Button>
      </motion.div>
    </MotionConfig>
  )
}
