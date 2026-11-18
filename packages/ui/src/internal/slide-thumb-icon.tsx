import { ArrowRightIcon, CheckIcon } from '@phosphor-icons/react'

import { cn } from '../lib/cn.ts'

/** The thumb's icon: an arrow leaning once armed, a spinner, then a check. */
export function SlideThumbIcon({
  armed,
  busy,
  done,
}: {
  armed: boolean
  busy: boolean
  done: boolean
}) {
  return (
    <span className="relative size-5">
      <ArrowRightIcon
        aria-hidden="true"
        weight="bold"
        className={cn(
          'absolute inset-0 size-5 transition-[opacity,translate,filter] duration-200 ease-out motion-reduce:transition-none',
          armed && !busy && !done && 'translate-x-0.5',
          (busy || done) && 'translate-x-1.5 opacity-0 blur-[2px]',
        )}
      />
      <CheckIcon
        aria-hidden="true"
        weight="bold"
        className={cn(
          'absolute inset-0 size-5 text-success-fg transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none',
          done ? 'scale-100 opacity-100' : 'scale-50 opacity-0 blur-[2px]',
        )}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={cn(
          'absolute -inset-0.5 size-6 animate-spin transition-opacity duration-200 [animation-duration:700ms]',
          // Paused, not removed, so it fades out without snapping back.
          busy
            ? 'opacity-100 delay-100'
            : 'opacity-0 [animation-play-state:paused]',
        )}
      >
        <circle
          className="stroke-tray"
          cx="12"
          cy="12"
          fill="none"
          r="9"
          strokeWidth="2.5"
        />
        <circle
          className="stroke-current"
          cx="12"
          cy="12"
          fill="none"
          r="9"
          strokeDasharray="14 43"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
    </span>
  )
}
