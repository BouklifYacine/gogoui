import * as React from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { MenuHighlight } from '../internal/menu-highlight.tsx'
import { menuPanel, menuRow } from '../internal/menu-styles.ts'
import {
  phoneSheetBackdrop,
  phoneSheetPanel,
  phoneSheetPositioner,
} from '../internal/phone-sheet.ts'
import { cn } from '../lib/cn.ts'

/**
 * Actions in a menu opened from a button.
 *
 * **Use it for** three or more actions of one subject, sorting choices,
 * « … » on a row (`RowActionsMenu` does it for a table row). **Not for**
 * navigation between pages (links) or one value in a form (`Select`).
 *
 * **Where**: under its trigger button. On a phone (under 768px) it rises
 * from the screen's bottom edge instead, full width over a veil, within the
 * thumb's reach; its sub-menus stay floating over it.
 *
 * **States**: items default, highlighted, disabled, destructive (last,
 * red), checked (checkbox and radio items), submenus.
 *
 * **Compose**: `DropdownMenu` > `DropdownMenuTrigger` + `DropdownMenuContent`
 * > `DropdownMenuItem`s (+ `Label`, `Separator`, `Shortcut`, `Sub`…).
 *
 * **Key props**: `variant="destructive"` on an item; `align`, `side` on the
 * content; `phoneSheet={false}` on the content keeps a floating menu on a
 * phone too (a menu drawn on purpose beside its button).
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
  phoneSheet = true,
  className,
  children,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  > & {
    /**
     * Under 768px, the menu rises from the screen's bottom edge, full
     * width over a veil, within the thumb's reach; a menu as usual above.
     * On by default; `false` keeps the floating menu on a phone too.
     */
    phoneSheet?: boolean
  }) {
  return (
    <MenuPrimitive.Portal>
      {phoneSheet && (
        <MenuPrimitive.Backdrop
          data-slot="dropdown-menu-backdrop"
          className={phoneSheetBackdrop}
        />
      )}
      <MenuPrimitive.Positioner
        className={cn(
          'isolate z-50 outline-none',
          phoneSheet && phoneSheetPositioner,
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
              cn(
                phoneSheetPanel,
                'max-md:px-2 max-md:pt-2 max-md:pb-[calc(0.5rem+env(safe-area-inset-bottom))]',
              ),
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

// A sub-menu stays floating on a phone too: beside its row, or over the
// sheet when the screen has no room beside it. A second sheet would bury the
// first under a second veil, and its row would no longer show where it came from.
function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -3,
  side = 'right',
  sideOffset = 0,
  phoneSheet = false,
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
      phoneSheet={phoneSheet}
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
