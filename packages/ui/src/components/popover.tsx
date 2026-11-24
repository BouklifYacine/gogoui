import * as React from 'react'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import {
  phoneSheetBackdrop,
  phoneSheetPanel,
  phoneSheetPositioner,
  phoneSheetSafeArea,
} from '../internal/phone-sheet.ts'
import { cn } from '../lib/cn.ts'

/**
 * A floating panel anchored to its trigger.
 *
 * **Use it for** a small form or a picker that stays near what it changes
 * (a date, a colour, a quick filter). **Not for** a label (`Tooltip`) or a
 * list of actions (`DropdownMenu`).
 *
 * **Where**: under or beside its trigger button. On a phone (under 768px)
 * it rises from the screen's bottom edge instead, full width over a veil,
 * within the thumb's reach; a tap on the veil closes it.
 *
 * **Key props** (on `PopoverContent`): `side`, `align`, `sideOffset`;
 * `phoneSheet={false}` keeps it beside its trigger on a phone too.
 *
 * **Compose**: `Popover` > `PopoverTrigger` + `PopoverContent` >
 * `PopoverHeader` (`PopoverTitle`, `PopoverDescription`) + body.
 *
 * **Accessibility**: Escape closes it and gives the focus back. The sheet
 * is the same dialog: Tab leaving it closes it, as beside its trigger.
 *
 * @summary A floating panel anchored to its trigger.
 */
function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  anchor,
  collisionPadding,
  phoneSheet = true,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    | 'align'
    | 'alignOffset'
    | 'side'
    | 'sideOffset'
    | 'anchor'
    | 'collisionPadding'
  > & {
    /**
     * Under 768px, the panel rises from the screen's bottom edge, full
     * width over a veil, within the thumb's reach; beside its trigger as
     * usual above. On by default; `false` keeps it beside its trigger.
     */
    phoneSheet?: boolean
  }) {
  return (
    <PopoverPrimitive.Portal>
      {phoneSheet && (
        <PopoverPrimitive.Backdrop
          data-slot="popover-backdrop"
          className={phoneSheetBackdrop}
        />
      )}
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        // Opened from something else than its trigger (a date in the
        // calendar): it stands beside that element.
        anchor={anchor}
        collisionPadding={collisionPadding}
        className={cn('isolate z-50', phoneSheet && phoneSheetPositioner)}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          // Its rise and fall on a phone live in styles.css (popover-content).
          data-phone-sheet={phoneSheet || undefined}
          className={cn(
            'z-50 flex w-72 origin-(--transform-origin) flex-col gap-3 rounded-parent-2xl bg-floating p-3 text-sm text-fg shadow-md outline-hidden duration-150 ease-tactile data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            // Before the caller's classes, so its own padding can win.
            phoneSheet && phoneSheetSafeArea,
            className,
            phoneSheet && cn(phoneSheetPanel, 'max-md:overflow-y-auto'),
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn('flex flex-col gap-1 text-sm', className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('font-medium', className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('text-fg-muted', className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
