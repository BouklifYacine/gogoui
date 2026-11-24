import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { m } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { blur, duration, ease, spring } from './motion.ts'
import { MotionWords } from './motion-words.tsx'

type FieldMessageRowProps = {
  id: string
  tone: 'muted' | 'danger'
  /** `field-description` or `field-error`, as Field's own parts. */
  slot: string
  children: ReactNode
}

/**
 * One line under a field (its help or its error), after Arc UI
 * (https://uiarc.dev, MIT): the row opens its height on a spring, then
 * the words settle in. The row follows the measured text, so a longer
 * message that wraps opens its next line instead of snapping.
 *
 * The space above the text is padding inside the clipped row, and a
 * negative margin gives the field's gap back: a closed row takes no room.
 *
 * @summary Internal: the animated help or error row of FieldShell.
 */
export function FieldMessageRow({
  id,
  tone,
  slot,
  children,
}: FieldMessageRowProps) {
  const reduce = useReduceMotion()
  const [height, setHeight] = useState<number | 'auto'>('auto')

  // Watches the text's height while the row is on screen.
  const measure = useCallback((node: HTMLDivElement | null) => {
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <m.div
      className="-mt-2 overflow-hidden"
      // Still, the row is there at full height at once: a zero-length
      // opening would still paint one closed frame.
      initial={reduce ? false : { height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{
        height: 0,
        opacity: 0,
        transition: reduce
          ? { duration: 0 }
          : {
              height: spring.smooth,
              opacity: { duration: duration.instant },
            },
      }}
      transition={
        reduce
          ? { duration: 0 }
          : { height: spring.smooth, opacity: { duration: duration.fast } }
      }
    >
      <div
        ref={measure}
        id={id}
        data-slot={slot}
        className={cn(
          'pt-2 text-left text-sm leading-normal font-normal',
          tone === 'danger' ? 'text-danger-fg' : 'text-fg-muted',
          '[&_a]:underline [&_a]:underline-offset-4',
        )}
      >
        <m.div
          initial={
            reduce ? false : { y: '0.35em', filter: `blur(${blur.soft}px)` }
          }
          animate={{ y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: reduce ? 0 : duration.standard,
            ease: ease.enter,
          }}
        >
          {/* Words move one by one; a richer help moves as one block. */}
          {typeof children === 'string' ? (
            <MotionWords text={children} />
          ) : (
            children
          )}
        </m.div>
      </div>
    </m.div>
  )
}
