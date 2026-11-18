import {
  ArchiveIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'

const meta = preview.meta({
  title: 'Composants/DropdownMenu',
  component: DropdownMenu,
})

/**
 * A row's « … »: the usual actions, then the destructive one apart, in
 * red.
 *
 * @summary A row's actions, the destructive one last.
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
})
