import { useCallback, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { spring } from './motion.ts'

/**
 * A box whose height springs to its content's, after Arc UI's blog
 * (https://uiarc.dev, MIT), so what sits below glides instead of jumping.
 * It springs only while `armedUntil` (a `performance.now()` time, set by
 * the caller when it changes the page) has not passed: a late font or a
 * narrower window apply at once. It clips only while it moves, so focus
 * outlines stay whole.
 *
 * @summary Internal: a box whose height springs after a page change.
 */
export function AutoHeight({
  armedUntil,
  className,
  children,
}: {
  armedUntil: RefObject<number>
  className?: string
  children: ReactNode
}) {
  const reduce = useReduceMotion()
  const height = useMotionValue<number | 'auto'>('auto')
  const clipRef = useRef<HTMLDivElement>(null)

  const measure = useCallback(
    (content: HTMLDivElement | null) => {
      if (!content || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      let controls: ReturnType<typeof animate> | undefined
      const unclip = () => {
        delete clipRef.current?.dataset.clip
      }
      const observer = new ResizeObserver(() => {
        const next = content.offsetHeight
        controls?.stop()
        if (
          !next ||
          reduce ||
          height.get() === 'auto' ||
          performance.now() > armedUntil.current
        ) {
          height.jump(next || 'auto')
          unclip()
          return
        }
        if (clipRef.current) {
          clipRef.current.dataset.clip = ''
        }
        controls = animate(height, next, {
          ...spring.smooth,
          onComplete: unclip,
        })
      })
      observer.observe(content)
      return () => {
        observer.disconnect()
        controls?.stop()
      }
    },
    [height, reduce, armedUntil],
  )

  return (
    <motion.div
      ref={clipRef}
      className="min-w-0 data-[clip]:overflow-hidden"
      style={{ height }}
    >
      <div ref={measure} className={className}>
        {children}
      </div>
    </motion.div>
  )
}
