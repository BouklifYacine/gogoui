import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn.ts'

import { Button } from './button.tsx'
import { Input } from './input.tsx'
import { Textarea } from './textarea.tsx'

/**
 * A field with an icon, a unit, a text or a button inside.
 *
 * **Use it for** « € » after an amount, a search with its button, a URL
 * with its prefix. **Prefer** `InputWithIcon` for a lone decorative icon.
 *
 * **Compose**: `InputGroup` > `InputGroupAddon` (align inline-start or
 * inline-end, block-start…) + `InputGroupInput` (or `InputGroupTextarea`);
 * `InputGroupButton`, `InputGroupText` inside an addon.
 *
 * **Accessibility**: the field keeps its own label; a button inside needs a
 * name.
 *
 * @summary A field with an icon, a unit or a button inside.
 */
function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center rounded-lg bg-field text-fg shadow-field ring-1 ring-field-line transition-[box-shadow] outline-none ring-inset max-md:h-11 hover:ring-fg-subtle in-data-[slot=combobox-content]:shadow-none in-data-[slot=combobox-content]:focus-within:ring-field-line has-disabled:bg-subtle has-disabled:opacity-60 has-[[data-slot=input-group-control]:focus-visible]:shadow-focus has-[[data-slot=input-group-control]:focus-visible]:ring-line-focus has-[[data-slot][aria-invalid=true]]:ring-danger has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=inline-start]]:[&>input]:pl-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg]:text-fg-subtle",
        className,
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-2 text-sm font-medium text-fg-subtle select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-xs [&>svg:not([class*='size-'])]:size-4.5",
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-3 has-[>button]:-ml-1',
        'inline-end': 'order-last pr-3 has-[>button]:-mr-1',
        'block-start':
          'order-first w-full justify-start px-3 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2',
        'block-end':
          'order-last w-full justify-start px-3 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    // A click beside the field focuses it, for the mouse only: the
    // keyboard reaches the field itself.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  'flex items-center gap-2 text-sm shadow-none',
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-md px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: '',
        'icon-xs': 'size-6 rounded-md p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
)

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size' | 'type'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: 'button' | 'submit' | 'reset'
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'h-full flex-1 rounded-none bg-transparent shadow-none ring-0 hover:ring-0 focus-visible:shadow-none focus-visible:ring-0 max-md:h-full disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'flex-1 resize-none rounded-none bg-transparent py-2 shadow-none ring-0 hover:ring-0 focus-visible:shadow-none focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
