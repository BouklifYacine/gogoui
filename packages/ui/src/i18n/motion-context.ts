import { createContext, useContext } from 'react'
import { useReducedMotion } from 'motion/react'

/** GoGoUIProvider's `motion`: `auto` follows the system, `off` stills everything. */
export const MotionPreferenceContext = createContext<'auto' | 'off'>('auto')

/**
 * True when a component must stay still: the visitor's system asks for
 * less motion, or the app set GoGoUIProvider motion="off". Use it in place
 * of `useReducedMotion`, which only reads the system.
 */
export function useReduceMotion(): boolean {
  const system = useReducedMotion() ?? false
  return useContext(MotionPreferenceContext) === 'off' || system
}
