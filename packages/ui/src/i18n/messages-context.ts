import { createContext, use } from 'react'

import { fr } from './locales/fr.ts'
import { mergeMessages } from './merge-messages.ts'
import type { GoGoUIMessages } from './messages.ts'

/**
 * French until a GoGoUIProvider says otherwise. Only French is imported
 * here, so an app that never speaks English never loads English.
 */
export const MessagesContext = createContext<GoGoUIMessages>(fr)

/**
 * The words of the current language, for a component that writes some.
 * A component passes its `labels` prop: its words win over the
 * provider's, which win over the language's.
 *
 * @summary Read GoGoUI's words in the current language.
 */
export function useGoGoUIMessages(
  labels?: Partial<GoGoUIMessages>,
): GoGoUIMessages {
  return mergeMessages(use(MessagesContext), labels)
}
