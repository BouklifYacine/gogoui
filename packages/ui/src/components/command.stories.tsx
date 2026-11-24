import { CalendarIcon, FileTextIcon, UsersIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command.tsx'

const meta = preview.meta({
  title: 'Menus/Command',
  component: Command,
  subcomponents: {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
  },
})

/**
 * Go anywhere by typing a few letters: the list filters, Enter opens.
 */
export const Basic = meta.story({
  render: () => (
    <Command className="w-80 shadow-menu">
      <CommandInput placeholder="Aller à…" />
      <CommandList>
        <CommandEmpty>Rien ne correspond.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem>
            <CalendarIcon />
            Calendrier
          </CommandItem>
          <CommandItem>
            <UsersIcon />
            Clients
          </CommandItem>
          <CommandItem>
            <FileTextIcon />
            Factures
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
})
