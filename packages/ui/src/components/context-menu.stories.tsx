import {
  ArchiveIcon,
  CopyIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './context-menu.tsx'

const meta = preview.meta({
  title: 'Composants/ContextMenu',
  component: ContextMenu,
  subcomponents: { ContextMenuTrigger, ContextMenuContent, ContextMenuItem },
})

/**
 * Right-click the card (or press long on a phone): its actions open
 * where the pointer is.
 *
 * @summary The menu of a right click.
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
})
