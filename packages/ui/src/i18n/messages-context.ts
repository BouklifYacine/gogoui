import { createContext, use } from 'react'

import { messages } from './messages.ts'
import type { GoGoUIMessages } from './messages.ts'

/** French until a GoGoUIProvider says otherwise. */
export const MessagesContext = createContext<GoGoUIMessages>(messages.fr)

/**
 * The words of the current language, for a component that writes some.
 *
 * @summary Read GoGoUI's words in the current language.
 */
export function useGoGoUIMessages(): GoGoUIMessages {
  return use(MessagesContext)
}
