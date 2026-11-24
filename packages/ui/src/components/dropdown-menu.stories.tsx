import {
  ArchiveIcon,
  CaretDownIcon,
  CopyIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  ShareIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'

const meta = preview.meta({
  title: 'Menus/DropdownMenu',
  component: DropdownMenu,
  subcomponents: {
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
  },
})

/**
 * A row's « … »: the usual actions, then the destructive one apart, in
 * red.
 */
export const Basic = meta.story({
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="soft" size="icon" aria-label="Actions" />}
      >
        <DotsThreeIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>
          <PencilSimpleIcon />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArchiveIcon />
          Archiver
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <TrashIcon />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  // Opens on a click with the focus in the menu; Escape closes it and gives
  // the focus back to « … ».
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Actions',
    })
    await userEvent.click(trigger)
    const menu = await page.findByRole('menu')
    // The rows fade in one after another: wait for them.
    await waitFor(() =>
      expect(
        within(menu).getByRole('menuitem', { name: 'Modifier' }),
      ).toBeVisible(),
    )
    await waitFor(() =>
      expect(menu).toContainElement(document.activeElement as HTMLElement),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  },
})

/**
 * The menu grows from its button, its rows following one after another;
 * the highlight glides under the pointer and jumps with the arrow keys;
 * the button's chevron turns over while it is open.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" iconEnd={<CaretDownIcon />} />}
      >
        Actions du projet
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projet</DropdownMenuLabel>
          <DropdownMenuItem>
            <PencilSimpleIcon />
            Renommer
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CopyIcon />
            Dupliquer
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ShareIcon />
            Partager
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ArchiveIcon />
          Archiver
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <TrashIcon />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
})
