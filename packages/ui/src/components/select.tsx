import { Select as SelectPrimitive } from '@base-ui/react/select'
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'

import { SelectHighlight } from '../internal/select-highlight.tsx'
import { cn } from '../lib/cn.ts'

/**
 * One choice in a list of six or more. For two to five choices seen at
 * once, prefer radio buttons; for a date or an amount, never a select.
 * Compose it: `Select` (pass `items` so the trigger shows the label of the
 * value, not its code) > `SelectTrigger` > `SelectValue`, then
 * `SelectContent` > `SelectItem`s.
 *
 * @summary A list to pick one value from; pass `items` for the labels.
 */
const Select = SelectPrimitive.Root

/** @summary A group of items under a SelectLabel. */
function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  )
}

/**
 * The chosen value's label in the trigger, or the `placeholder` (an
 * example, never the field's label) while nothing is chosen.
 *
 * @summary Shows the chosen value or the placeholder.
 */
function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex flex-1 text-left', className)}
      {...props}
    />
  )
}

type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  /** `sm` for a toolbar, `lg` for a big form; 44px on a phone either way. */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * The button that opens the list, with the same edge as an Input and a
 * caret that turns while open.
 *
 * @summary The button showing the value and opening the list.
 */
function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group/select-trigger flex w-fit items-center justify-between gap-2 rounded-lg bg-control px-3 text-sm text-fg whitespace-nowrap shadow-button transition-[color,background-color,box-shadow,scale] duration-150 ease-tactile outline-none select-none hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus active:scale-[0.97] data-popup-open:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:ring-1 aria-invalid:ring-danger data-placeholder:text-fg-subtle data-[size=default]:h-9 data-[size=default]:max-md:h-11 data-[size=sm]:h-8 data-[size=sm]:rounded-md data-[size=lg]:h-11 data-[size=lg]:text-base max-md:text-[16px] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <CaretDownIcon
            aria-hidden="true"
            className="pointer-events-none size-3.5 text-fg-subtle transition-transform duration-150 ease-tactile group-data-popup-open/select-trigger:rotate-180"
          />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >

/**
 * The list. It drops from under its button on a spring, its rows falling
 * in one after another, a soft highlight sliding from row to row.
 *
 * @summary The open list of items, positioned under the trigger.
 */
function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 6,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            // Its opening is a spring in styles.css (select-drop); its
            // closing a short fade.
            'relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-parent-2xl bg-floating p-2 text-fg shadow-menu duration-150 ease-tactile data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...props}
        >
          <SelectHighlight />
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/** @summary The title of a SelectGroup. */
function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('px-1.5 py-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

/**
 * One choice of the list; the chosen one gets a tick that draws itself.
 *
 * @summary One value of the list.
 */
function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Its background is the sliding highlight (SelectHighlight).
        "relative flex w-full cursor-default min-h-9 items-center gap-2 rounded-concentric-2 py-2 pr-8 pl-2 text-sm text-fg-muted max-md:min-h-11 outline-hidden select-none focus:text-fg not-data-[variant=destructive]:focus:**:text-fg data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        {/* A tick that draws itself (select-tick in styles.css). */}
        <svg
          data-slot="select-tick"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none size-4"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

/** @summary A hairline between two groups of items. */
function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

/** @summary Scrolls a long list up. Used by SelectContent. */
function SelectScrollUpButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      <CaretUpIcon aria-hidden="true" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

/** @summary Scrolls a long list down. Used by SelectContent. */
function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      <CaretDownIcon aria-hidden="true" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
export type { SelectContentProps, SelectTriggerProps }
