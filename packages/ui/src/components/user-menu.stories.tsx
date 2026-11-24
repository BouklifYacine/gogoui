import {
  CreditCardIcon,
  GearSixIcon,
  LifebuoyIcon,
  UserIcon,
} from '@phosphor-icons/react'

import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { DropdownMenuItem } from './dropdown-menu.tsx'
import { UserMenu } from './user-menu.tsx'

const meta = preview.meta({
  title: 'Menus/UserMenu',
  tags: ['beta'],
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
  // The photo opens the menu; Escape closes it and gives the focus back.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Menu du compte, Camille Durand',
    })
    await userEvent.click(trigger)
    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      'menu',
    )
    await waitFor(() =>
      expect(
        within(menu).getByRole('menuitem', { name: 'Se déconnecter' }),
      ).toBeVisible(),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
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
 * On a phone, the menu rises from the bottom edge as a sheet, within the
 * thumb's reach (`phoneSheet`, on by default).
 */
export const OnAPhone = meta.story({
  globals: { viewport: { value: 'phone' } },
  args: {
    user: USER,
    items: ITEMS,
    onSignOut: () => undefined,
  },
})

/**
 * At a sidebar's foot: the trigger as wide as the sidebar, the chevron at
 * its far end, the menu opening upwards.
 */
export const InASidebar = meta.story({
  decorators: [
    (Story) => (
      <div className="flex min-h-120 w-64 flex-col justify-end border-r border-border p-2">
        {Story()}
      </div>
    ),
  ],
  args: {
    user: USER,
    items: ITEMS,
    showName: true,
    side: 'top',
    align: 'start',
    className: 'w-full',
    onSignOut: () => undefined,
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

/**
 * The theme's choices from the keyboard: the chosen one wears the focus
 * outline, as the rail behind is already grey. 44 px each on a phone.
 */
export const ThemeFromTheKeyboard = meta.story({
  args: {
    user: USER,
    items: ITEMS,
    onSignOut: () => undefined,
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    within(canvasElement)
      .getByRole('button', { name: 'Menu du compte, Camille Durand' })
      .focus()
    await userEvent.keyboard('{Enter}')
    await page.findByRole('menu')
    // Down through the rows until a theme choice has the focus.
    for (let step = 0; step < 8; step += 1) {
      if (document.activeElement?.getAttribute('role') === 'menuitemradio') {
        break
      }
      await userEvent.keyboard('{ArrowDown}')
    }
    const choice = document.activeElement as HTMLElement
    await expect(choice).toHaveAttribute('role', 'menuitemradio')
    await expect(getComputedStyle(choice).outlineStyle).toBe('solid')
  },
})
