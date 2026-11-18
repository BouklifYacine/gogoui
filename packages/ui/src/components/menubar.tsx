import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar'
import type { ComponentProps } from 'react'

import { cn } from '../lib/cn.ts'
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
} from './dropdown-menu.tsx'

/**
 * An application's bar of menus (« Fichier », « Édition », « Affichage »):
 * once one is open, the others open on hover, and the arrows move between
 * them. For a desktop-like tool; a site uses `NavigationMenu`. Compose it:
 * `Menubar` > `MenubarMenu` > `MenubarTrigger` + `MenubarContent` >
 * `MenubarItem`s.
 *
 * @summary An application's bar of menus.
 */
function Menubar({
  className,
  ...props
}: ComponentProps<typeof MenubarPrimitive>) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn(
        'flex h-10 w-fit items-center gap-1 rounded-xl bg-tray p-1',
        className,
      )}
      {...props}
    />
  )
}

function MenubarTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'flex h-8 items-center rounded-lg px-3 text-sm font-medium text-fg-muted outline-none select-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-line-focus data-popup-open:bg-raised data-popup-open:text-fg data-popup-open:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarTrigger,
  DropdownMenu as MenubarMenu,
  DropdownMenuContent as MenubarContent,
  DropdownMenuItem as MenubarItem,
  DropdownMenuCheckboxItem as MenubarCheckboxItem,
  DropdownMenuRadioGroup as MenubarRadioGroup,
  DropdownMenuRadioItem as MenubarRadioItem,
  DropdownMenuLabel as MenubarLabel,
  DropdownMenuGroup as MenubarGroup,
  DropdownMenuSeparator as MenubarSeparator,
  DropdownMenuShortcut as MenubarShortcut,
  DropdownMenuSub as MenubarSub,
  DropdownMenuSubTrigger as MenubarSubTrigger,
  DropdownMenuSubContent as MenubarSubContent,
}
