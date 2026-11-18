import type { ReactNode } from 'react'

import { messages } from './messages.ts'
import type { GoGoUILocale, GoGoUIMessages } from './messages.ts'
import { MessagesContext } from './messages-context.ts'

type GoGoUIProviderProps = {
  /** The language of GoGoUI's own words. French by default. */
  locale?: GoGoUILocale
  /** Your own words, over the language's (« Fermer » becomes « Retour »). */
  messages?: Partial<GoGoUIMessages>
  children: ReactNode
}

/**
 * Sets the language of the words GoGoUI writes itself: screen reader
 * labels, default buttons. Optional: without it, GoGoUI speaks French.
 * Put it once around the app.
 *
 * @summary Choose GoGoUI's language, or override some of its words.
 */
export function GoGoUIProvider({
  locale = 'fr',
  messages: overrides,
  children,
}: GoGoUIProviderProps) {
  return (
    <MessagesContext value={{ ...messages[locale], ...overrides }}>
      {children}
    </MessagesContext>
  )
}
