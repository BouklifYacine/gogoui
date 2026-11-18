import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { IconContext } from '@phosphor-icons/react'
import type { IconWeight } from '@phosphor-icons/react'

import { defaultIcons } from './icons.ts'
import type { GoGoUIIcons } from './icons.ts'
import { IconsContext } from './icons-context.ts'
import { messages } from './messages.ts'
import type { GoGoUILocale, GoGoUIMessages } from './messages.ts'
import { MessagesContext } from './messages-context.ts'

type GoGoUIProviderProps = {
  /** The language of GoGoUI's own words. French by default. */
  locale?: GoGoUILocale
  /** Your own words, over the language's (« Fermer » becomes « Retour »). */
  messages?: Partial<GoGoUIMessages>
  /**
   * Your own icons, over Phosphor's: any component taking a `className`
   * (`{ close: X, check: Check }` from Lucide). Every GoGoUI component
   * follows.
   */
  icons?: Partial<GoGoUIIcons>
  /** The weight of every Phosphor icon: thin, light, regular, bold, fill, duotone. */
  iconWeight?: IconWeight
  children: ReactNode
}

/**
 * Sets the words GoGoUI writes itself (screen reader labels, default
 * buttons) and the icons it draws. Optional: without it, GoGoUI speaks
 * French with Phosphor's icons. Put it once around the app.
 *
 * @summary Choose GoGoUI's language and icons, or override some of them.
 */
export function GoGoUIProvider({
  locale = 'fr',
  messages: overrides,
  icons,
  iconWeight,
  children,
}: GoGoUIProviderProps) {
  const words = useMemo(
    () => ({ ...messages[locale], ...overrides }),
    [locale, overrides],
  )
  const drawn = useMemo(() => ({ ...defaultIcons, ...icons }), [icons])
  const weight = useMemo(
    () => (iconWeight ? { weight: iconWeight } : undefined),
    [iconWeight],
  )
  const content = (
    <MessagesContext value={words}>
      <IconsContext value={drawn}>{children}</IconsContext>
    </MessagesContext>
  )
  return weight ? (
    <IconContext.Provider value={weight}>{content}</IconContext.Provider>
  ) : (
    content
  )
}
