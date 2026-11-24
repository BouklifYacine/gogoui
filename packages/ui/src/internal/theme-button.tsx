import { useCallback, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Transition } from 'motion/react'

import { Button } from '../components/button.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { GoGoIcon } from './gogo-icon.tsx'
import { MotionScope } from './motion-scope.tsx'
import { blur, duration, ease, spring } from './motion.ts'
import { subscribeTheme, writeTheme } from './theme-store.ts'

// Whether the page shows dark now: the chosen theme, or the device's when
// « system ». The server has no page: light.
const isDark = () => document.documentElement.classList.contains('dark')

// The scale and the turn ride the spring; opacity and blur tween, so the
// blur never dips below zero.
const turn: Transition = {
  ...spring.snappy,
  opacity: { duration: duration.fast, ease: ease.enter },
  filter: { duration: duration.fast, ease: ease.enter },
}
const leave: Transition = { duration: duration.fast, ease: ease.standard }

const iconSizes = {
  sm: 'icon-sm',
  default: 'icon',
  lg: 'icon-lg',
} as const

/** The words ThemeButton writes, to change on one ThemeButton only. */
type ThemeButtonLabels = Partial<Pick<GoGoUIMessages, 'darkMode'>>

/**
 * ThemeToggle variant="button", after Arc UI (https://uiarc.dev, MIT): one
 * button between light and dark whose sun and moon trade places with a
 * turn, both the same way (clockwise into dark, back out of it).
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary Internal: ThemeToggle's one-button variant.
 */
export function ThemeButton({
  compact,
  size,
  className,
  labels,
}: {
  compact: boolean
  size: 'sm' | 'default' | 'lg'
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ThemeButtonLabels
}) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false)

  // Nothing turns before two frames are painted: a stored theme that
  // arrives as the page wakes up swaps the icon in place.
  const [settled, setSettled] = useState(false)
  const waitForPaint = useCallback((node: HTMLSpanElement | null) => {
    if (!node) {
      return undefined
    }
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setSettled(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])

  const angle = dark ? -30 : 30
  const still = !settled || reduce

  return (
    <MotionScope>
      <Button
        variant="outline"
        size={compact ? iconSizes[size] : size}
        data-slot="theme-toggle"
        data-theme={dark ? 'dark' : 'light'}
        aria-pressed={dark}
        aria-label={compact ? messages.darkMode : undefined}
        title={compact ? messages.darkMode : undefined}
        className={className}
        onClick={() => writeTheme(dark ? 'light' : 'dark')}
      >
        <span
          ref={waitForPaint}
          aria-hidden="true"
          className="relative inline-grid size-4 flex-none place-items-center"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={dark ? 'dark' : 'light'}
              className="col-start-1 row-start-1 grid place-items-center [&_svg]:size-4"
              initial={
                !settled
                  ? false
                  : reduce
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.7,
                        rotate: angle,
                        filter: `blur(${blur.subtle}px)`,
                      }
              }
              animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
              exit={
                !settled
                  ? { opacity: 0, transition: { duration: 0 } }
                  : reduce
                    ? { opacity: 0, transition: { duration: duration.instant } }
                    : {
                        opacity: 0,
                        scale: 0.7,
                        rotate: angle,
                        filter: `blur(${blur.subtle}px)`,
                        transition: leave,
                      }
              }
              transition={still ? { duration: duration.instant } : turn}
            >
              <GoGoIcon name={dark ? 'themeDark' : 'themeLight'} />
            </motion.span>
          </AnimatePresence>
        </span>
        {!compact && (
          <span className="whitespace-nowrap">{messages.darkMode}</span>
        )}
      </Button>
    </MotionScope>
  )
}
export type { ThemeButtonLabels }
