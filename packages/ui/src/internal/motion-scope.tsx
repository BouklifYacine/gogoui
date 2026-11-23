import { useContext } from 'react'
import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'

import { MotionPreferenceContext } from '../i18n/motion-context.ts'

/**
 * The `MotionConfig` every animated component sits in: still when the
 * system asks for less motion, and always still under GoGoUIProvider
 * motion="off".
 */
export function MotionScope({ children }: { children: ReactNode }) {
  const preference = useContext(MotionPreferenceContext)
  return (
    <MotionConfig reducedMotion={preference === 'off' ? 'always' : 'user'}>
      {children}
    </MotionConfig>
  )
}
