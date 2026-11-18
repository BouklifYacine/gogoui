import { createContext, use } from 'react'

import { defaultIcons } from './icons.ts'
import type { GoGoUIIcons } from './icons.ts'

/** Phosphor's until a GoGoUIProvider says otherwise. */
export const IconsContext = createContext<GoGoUIIcons>(defaultIcons)

/**
 * The icons GoGoUI draws, as the provider set them.
 *
 * @summary Read GoGoUI's icons.
 */
export function useGoGoUIIcons(): GoGoUIIcons {
  return use(IconsContext)
}
