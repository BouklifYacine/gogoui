import { m } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { duration, ease, spring } from './motion.ts'

/**
 * The round mark of a password condition, after Arc UI
 * (https://uiarc.dev, MIT): once met, a pale green tint grows under it
 * (.7 → 1) and the tick draws itself 60ms later; unmet, the tick draws
 * back quicker than it came.
 *
 * @summary Internal: the self-ticking mark of PasswordStrength's list.
 */
export function PasswordRuleMark({
  met,
  delay = 0,
}: {
  met: boolean
  /** Seconds to wait, when several conditions tick at once. */
  delay?: number
}) {
  const reduce = useReduceMotion()

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block size-4 shrink-0 rounded-full border-[1.25px] transition-colors duration-150 ease-standard motion-reduce:transition-none',
        met ? 'border-transparent' : 'border-line-strong',
      )}
    >
      <m.span
        className="absolute -inset-[1.25px] rounded-full bg-success/16"
        initial={false}
        animate={{ scale: met ? 1 : 0.7, opacity: met ? 1 : 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                scale: { ...spring.snappy, delay },
                opacity: {
                  duration: met ? duration.fast : duration.instant,
                  delay,
                },
              }
        }
      />
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute -inset-[1.25px] size-4 text-success-fg"
      >
        <m.path
          d="M4.75 8.25 7 10.5l4.25-4.75"
          initial={false}
          animate={{ pathLength: met ? 1 : 0, opacity: met ? 1 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : met
                ? {
                    pathLength: {
                      duration: duration.standard,
                      ease: ease.enter,
                      delay: delay + 0.06,
                    },
                    opacity: { duration: 0.05, delay: delay + 0.06 },
                  }
                : {
                    pathLength: {
                      duration: duration.fast,
                      ease: ease.standard,
                    },
                    opacity: { duration: duration.fast, delay: 0.06 },
                  }
          }
        />
      </svg>
    </span>
  )
}
