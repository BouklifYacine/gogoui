import {
  ArchiveIcon,
  CaretDownIcon,
  CopyIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  ShareIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'

const meta = preview.meta({
  title: 'Composants/DropdownMenu',
  component: DropdownMenu,
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
