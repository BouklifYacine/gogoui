import {
  CreditCardIcon,
  GearSixIcon,
  LifebuoyIcon,
  UserIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { DropdownMenuItem } from './dropdown-menu.tsx'
import { UserMenu } from './user-menu.tsx'

const meta = preview.meta({
  title: 'Composants/UserMenu',
  component: UserMenu,
  decorators: [
    (Story) => <div className="flex min-h-96 justify-end p-4">{Story()}</div>,
  ],
})

const USER = {
  name: 'Camille Durand',
  email: 'camille@domaine-des-tilleuls.fr',
  plan: 'Pro',
}

const ITEMS = [
  { label: 'Mon profil', icon: <UserIcon />, shortcut: '⌘P' },
  { label: 'Réglages', icon: <GearSixIcon />, shortcut: '⌘,' },
  { label: 'Abonnement', icon: <CreditCardIcon /> },
]

/**
 * The photo opens the menu: who is signed in, the account's pages, the
 * theme, and signing out.
 */
export const Basic = meta.story({
  args: {
    user: USER,
    items: ITEMS,
    onSignOut: () => undefined,
  },
})

/**
 * `showName`: the name and a chevron beside the photo, from 640px up.
 */
export const WithName = meta.story({
  args: {
    user: USER,
    items: ITEMS,
    showName: true,
    onSignOut: () => undefined,
  },
})

/**
 * Signing out returns a promise: the menu waits, its row turning.
 */
export const AsyncSignOut = meta.story({
  args: {
    user: USER,
    items: ITEMS,
    onSignOut: () => new Promise((resolve) => setTimeout(resolve, 1600)),
  },
})

/**
 * A presence dot, shaped as well as coloured; the plan badge in a colour.
 */
export const WithStatus = meta.story({
  args: {
    user: { ...USER, plan: 'Essai' },
    items: ITEMS,
    status: 'busy',
    planColor: 'warning',
    onSignOut: () => undefined,
  },
})

/**
 * More rows in `children`, without the theme switch.
 */
export const CustomRows = meta.story({
  args: {
    user: USER,
    showTheme: false,
    onSignOut: () => undefined,
    children: (
      <DropdownMenuItem>
        <LifebuoyIcon />
        Aide
      </DropdownMenuItem>
    ),
  },
})

/**
 * The menu grows from the photo, its rows following; the highlight glides
 * under the pointer; the theme's thumb slides; signing out turns and its
 * words rise.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: {
    user: USER,
    items: ITEMS,
    showName: true,
    onSignOut: () => new Promise((resolve) => setTimeout(resolve, 1600)),
  },
})
