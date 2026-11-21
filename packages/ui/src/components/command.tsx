import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog.tsx'
import { InputGroup, InputGroupAddon } from './input-group.tsx'
import { CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

/**
 * A filterable list of actions, or a command palette (cmdk).
 *
 * **Use it for** jumping anywhere with Ctrl K, picking among many actions.
 * **Not for** one value in a form (`Combobox` or `SelectField`).
 *
 * **Where**: in a `CommandDialog` opened by a shortcut, or inline in a
 * popover.
 *
 * **States**: empty query, filtered, no result (`CommandEmpty`), item
 * highlighted.
 *
 * **Compose**: `Command` > `CommandInput` + `CommandList` > `CommandGroup`s
 * > `CommandItem`s (+ `CommandShortcut`, `CommandSeparator`).
 *
 * **Accessibility**: arrows move, Enter runs; title and description are
 * read even when hidden.
 *
 * @summary A filterable list of actions, or a command palette.
 */
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex size-full flex-col overflow-hidden rounded-parent-2xl! bg-floating p-2 text-fg',
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title,
  description,
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  const { commandTitle, commandDescription } = useGoGoUIMessages()
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title ?? commandTitle}</DialogTitle>
        <DialogDescription>
          {description ?? commandDescription}
        </DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          'top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0',
          className,
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-2 pb-0">
      <InputGroup className="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            'w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <MagnifyingGlassIcon className="size-3.5 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none',
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('py-6 text-center text-sm', className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'overflow-hidden p-2 text-fg **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-fg-subtle',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-concentric-2 p-2 text-sm text-fg-muted outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-hover data-selected:text-fg [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-selected:*:[svg]:text-fg",
        className,
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
