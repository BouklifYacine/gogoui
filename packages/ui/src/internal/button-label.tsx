import type { ReactNode } from 'react'
import { AnimatePresence, m } from 'motion/react'

import { MotionScope } from './motion-scope.tsx'
import { duration, ease } from './motion.ts'

/**
 * A button's words, after Arc UI (https://uiarc.dev, MIT): when they change
 * (« Copier » → « Copié », « Envoyer » → « Envoi… »), the new words rise
 * 2px as they fade in and the old ones fade out faster, out of the flow.
 * Nothing moves on the first paint. Anything other than plain words is
 * drawn as it is.
 */
export function ButtonLabel({ children }: { children: ReactNode }) {
  if (typeof children !== 'string' && typeof children !== 'number') {
    return children
  }
  return (
    <MotionScope>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={children}
          data-slot="button-label"
          className="inline-block"
          initial={{ opacity: 0, y: 2 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: duration.standard, ease: ease.enter },
          }}
          exit={{
            opacity: 0,
            transition: { duration: duration.instant, ease: ease.standard },
          }}
        >
          {children}
        </m.span>
      </AnimatePresence>
    </MotionScope>
  )
}
