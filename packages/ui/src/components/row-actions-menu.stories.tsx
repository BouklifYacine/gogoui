import {
  ArchiveIcon,
  CopyIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { RowActionsMenu } from './row-actions-menu.tsx'

const meta = preview.meta({
  title: 'Menus/RowActionsMenu',
  component: RowActionsMenu,
})

const noop = () => undefined

/**
 * A row's actions, the destructive one last and apart.
 */
export const Basic = meta.story({
  args: {
    name: 'Grange',
    actions: [
      { label: 'Modifier', icon: PencilSimpleIcon, onSelect: noop },
      { label: 'Dupliquer', icon: CopyIcon, onSelect: noop },
      { label: 'Archiver', icon: ArchiveIcon, onSelect: noop },
      {
        label: 'Supprimer',
        icon: TrashIcon,
        destructive: true,
        onSelect: noop,
      },
    ],
  },
})

/**
 * While an action runs, the button spins and says what is happening.
 */
export const Pending = meta.story({
  args: {
    name: 'Grange',
    pending: 'Archivage…',
    actions: [{ label: 'Archiver', icon: ArchiveIcon, onSelect: noop }],
  },
})
