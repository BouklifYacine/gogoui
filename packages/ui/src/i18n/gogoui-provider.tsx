import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { IconContext } from '@phosphor-icons/react'
import type { IconWeight } from '@phosphor-icons/react'
import { MotionConfig } from 'motion/react'

import { defaultIcons } from './icons.ts'
import type { GoGoUIIcons } from './icons.ts'
import { IconsContext } from './icons-context.ts'
import { messages } from './messages.ts'
import type { GoGoUILocale, GoGoUIMessages } from './messages.ts'
import { MessagesContext } from './messages-context.ts'
import { MotionPreferenceContext } from './motion-context.ts'

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
 * @summary Choose GoGoUI's language, icons and motion, or override some of them.
 */
export function GoGoUIProvider({
  locale = 'fr',
  messages: overrides,
  icons,
  iconWeight,
  motion = 'auto',
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
