import {
  ArchiveIcon,
  CopyIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu.tsx'

const meta = preview.meta({
  title: 'Menus/ContextMenu',
  component: ContextMenu,
  subcomponents: {
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuCheckboxItem,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuLabel,
    ContextMenuGroup,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent,
  },
})

/**
 * Right-click the card (or press long on a phone): its actions open
 * where the pointer is.
 */
export const Basic = meta.story({
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-2xl border border-dashed border-line-strong text-sm text-fg-muted">
        Clic droit sur la carte
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <PencilSimpleIcon />
          Modifier
          <ContextMenuShortcut>E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <CopyIcon />
          Dupliquer
        </ContextMenuItem>
        <ContextMenuItem>
          <ArchiveIcon />
          Archiver
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <TrashIcon />
          Supprimer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  // A right-click opens the menu with the focus in it; Escape closes it.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const card = within(canvasElement).getByText('Clic droit sur la carte')
    await userEvent.pointer({ keys: '[MouseRight]', target: card })
    const menu = await page.findByRole('menu')
    // The rows fade in one after another: wait for them.
    await waitFor(() =>
      expect(
        within(menu).getByRole('menuitem', { name: /Dupliquer/ }),
      ).toBeVisible(),
    )
    await waitFor(() =>
      expect(menu).toContainElement(document.activeElement as HTMLElement),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument(),
    )
  },
})
