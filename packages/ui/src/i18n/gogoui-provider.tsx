import { use, useMemo } from 'react'
import type { ReactNode } from 'react'
import { IconContext } from '@phosphor-icons/react'
import type { IconWeight } from '@phosphor-icons/react'
import { MotionConfig } from 'motion/react'

import { defaultIcons } from './icons.ts'
import type { GoGoUIIcons } from './icons.ts'
import { IconsContext } from './icons-context.ts'
import { en } from './locales/en.ts'
import { fr } from './locales/fr.ts'
import { mergeMessages } from './merge-messages.ts'
import type { GoGoUILocale, GoGoUIMessages } from './messages.ts'
import { MessagesContext } from './messages-context.ts'
import { MotionPreferenceContext } from './motion-context.ts'

const shippedLanguages: Record<GoGoUILocale, GoGoUIMessages> = { fr, en }

type GoGoUIProviderProps = {
  /**
   * One of the languages GoGoUI ships: `fr` or `en`. Without it, the
   * language of a provider around this one, French at the top.
   */
  locale?: GoGoUILocale
  /**
   * A whole language (`messages={es}`, every key of GoGoUIMessages with its
   * own `intlLocale`), or a few words over the current one (« Fermer »
   * becomes « Retour »: `{ close: 'Retour' }`).
   */
  messages?: GoGoUIMessages | Partial<GoGoUIMessages>
  /**
   * Your own icons, over Phosphor's: any component taking a `className`
   * (`{ close: X, check: Check }` from Lucide). Every GoGoUI component
   * follows.
   */
  icons?: Partial<GoGoUIIcons>
  /** The weight of every Phosphor icon: thin, light, regular, bold, fill, duotone. */
  iconWeight?: IconWeight
  /**
   * `auto` (default): every component animates, and stays still for a
   * visitor whose system asks for less motion. `off`: nothing animates, for
   * everyone (portals included).
   */
  motion?: 'auto' | 'off'
  children: ReactNode
}

// The page-wide stillness of motion="off", for CSS transitions and
// animations; `motion/react` is stilled by MotionConfig. React hoists the
// <style> into <head>, so popups in portals follow too.
const MOTION_OFF = `*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}`

/**
 * Sets the words GoGoUI writes itself (screen reader labels, default
 * buttons), the icons it draws and whether it animates. Optional: without
 * it, GoGoUI speaks French with Phosphor's icons and animates. Put it once
 * around the app.
 *
 * Words, from strongest to weakest: a component's `labels` prop, then
 * `messages`, then the language (`locale`, or the provider around).
 *
 * @summary Choose GoGoUI's language, icons and motion, or override some of them.
 */
export function GoGoUIProvider({
  locale,
  messages: overrides,
  icons,
  iconWeight,
  motion = 'auto',
  children,
}: GoGoUIProviderProps) {
  const around = use(MessagesContext)
  const language = locale ? shippedLanguages[locale] : around
  const words = useMemo(
    () => mergeMessages(language, overrides),
    [language, overrides],
  )
  const drawn = useMemo(() => ({ ...defaultIcons, ...icons }), [icons])
  const weight = useMemo(
    () => (iconWeight ? { weight: iconWeight } : undefined),
    [iconWeight],
  )
  const content = (
    <MotionPreferenceContext value={motion}>
      <MotionConfig reducedMotion={motion === 'off' ? 'always' : 'user'}>
        {motion === 'off' && (
          <style href="gogoui-motion-off" precedence="high">
            {MOTION_OFF}
          </style>
        )}
        <MessagesContext value={words}>
          <IconsContext value={drawn}>{children}</IconsContext>
        </MessagesContext>
      </MotionConfig>
    </MotionPreferenceContext>
  )
  return weight ? (
    <IconContext.Provider value={weight}>{content}</IconContext.Provider>
  ) : (
    content
  )
}
