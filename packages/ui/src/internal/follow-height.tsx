import type { ReactNode } from 'react'
import { motion } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { MotionScope } from './motion-scope.tsx'
import { spring } from './motion.ts'
import { useElementSize } from './use-element-size.ts'

/**
 * A box whose height follows its content on a spring that never
 * overshoots, after Arc UI (https://uiarc.dev, MIT): a list that filters,
 * chips that wrap or unfold, never snap. It clips while it moves, so give
 * focus rings room inside it. Still with reduced motion.
 *
 * @summary Internal: a height that follows its content on a spring.
 */
export function FollowHeight({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReduceMotion()
  const [size, measure] = useElementSize<HTMLDivElement>()

  return (
    <MotionScope>
      <motion.div
        data-slot="follow-height"
        initial={false}
        animate={{ height: size?.height ?? 'auto' }}
        transition={reduce ? { duration: 0 } : spring.smooth}
        className={cn('overflow-hidden', className)}
      >
        <div ref={measure}>{children}</div>
      </motion.div>
    </MotionScope>
  )
}
