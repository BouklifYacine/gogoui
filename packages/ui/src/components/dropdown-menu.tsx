import * as React from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MenuHighlight } from '../internal/menu-highlight.tsx'
import { menuPanel, menuRow } from '../internal/menu-styles.ts'
import { cn } from '../lib/cn.ts'

/**
 * Actions in a menu opened from a button.
 *
 * **Use it for** three or more actions of one subject, sorting choices,
 * « … » on a row (`RowActionsMenu` does it for a table row). **Not for**
 * navigation between pages (links) or one value in a form (`Select`).
 *
 * **Where**: under its trigger button.
 *
 * **States**: items default, highlighted, disabled, destructive (last,
 * red), checked (checkbox and radio items), submenus.
 *
 * **Compose**: `DropdownMenu` > `DropdownMenuTrigger` + `DropdownMenuContent`
 * > `DropdownMenuItem`s (+ `Label`, `Separator`, `Shortcut`, `Sub`…).
 *
 * **Key props**: `variant="destructive"` on an item; `align`, `side` on the
 * content.
 *
 * **Accessibility**: arrows move, Enter chooses, Escape closes and returns
 * the focus.
 *
 * @summary Actions in a menu opened from a button.
 */
function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  phoneSheet = false,
  className,
  children,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  > & {
    /**
     * Under 640px, the menu rises from the screen's bottom edge, full
     * width over a veil, within the thumb's reach; a menu as usual above.
     */
    phoneSheet?: boolean
  }) {
  return (
    <MenuPrimitive.Portal>
      {phoneSheet && (
        <MenuPrimitive.Backdrop
          data-slot="dropdown-menu-backdrop"
          className="fixed inset-0 z-50 bg-overlay transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 sm:hidden"
        />
      )}
      <MenuPrimitive.Positioner
        className={cn(
          'isolate z-50 outline-none',
          // The positioner's inline place gives way to the bottom edge.
          phoneSheet &&
            'max-sm:fixed! max-sm:inset-x-0! max-sm:top-auto! max-sm:bottom-0! max-sm:left-0! max-sm:w-auto! max-sm:transform-none!',
        )}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          data-phone-sheet={phoneSheet || undefined}
          className={cn(
            menuPanel,
            'w-(--anchor-width) min-w-48',
            className,
            phoneSheet &&
              'max-sm:max-h-[85dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:px-2 max-sm:pt-2 max-sm:pb-[calc(0.5rem+env(safe-area-inset-bottom))]',
          )}
          {...props}
        >
          <MenuHighlight />
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-2.5 pt-2 pb-1 text-xs font-medium text-fg-subtle data-inset:pl-9',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        menuRow,
        'group/dropdown-menu-item data-[variant=destructive]:text-danger-fg data-[variant=destructive]:[&_svg]:text-danger-fg',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        menuRow,
        // While its sub-menu is open the row keeps a fill of its own: the
        // pointer has left for the sub-menu, the highlight with it.
        'data-popup-open:not-data-highlighted:bg-menu-highlight',
        className,
      )}
      {...props}
    >
      {children}
      <GoGoIcon name="chevronRight" aria-hidden="true" className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -3,
  side = 'right',
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn('w-auto min-w-40', className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(menuRow, 'pr-9', className)}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <GoGoIcon name="check" aria-hidden="true" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(menuRow, 'pr-9', className)}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <GoGoIcon name="check" aria-hidden="true" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1.5 my-1 h-px bg-line-subtle', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-fg-subtle',
        className,
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
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
}
