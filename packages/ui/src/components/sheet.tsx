import * as React from 'react'
import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'

/**
 * A side panel over the page.
 *
 * **Use it for** a record's details, an edit form, filters on a computer,
 * without losing the list behind. **Prefer** `Drawer` on a phone,
 * `Dialog` for a short decision.
 *
 * **Where**: from the right edge (left for a navigation).
 *
 * **Key props** (on `SheetContent`): `side` (right, left, top, bottom),
 * `size` (sm, default, lg, xl, full), `showCloseButton`.
 *
 * **Compose**: `Sheet` > `SheetTrigger` + `SheetContent` > `SheetHeader`
 * (`SheetTitle`, `SheetDescription`) + body + `SheetFooter`.
 *
 * **Accessibility**: a `SheetTitle` always; the focus is trapped and comes
 * back.
 *
 * @summary A side panel over the page; always give it a SheetTitle.
 */
function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-overlay backdrop-blur-[6px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

/** The words SheetContent writes, to change on one SheetContent only. */
type SheetContentLabels = Partial<Pick<GoGoUIMessages, 'close'>>

/** **Key props**: `labels` to change its words. */
function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  size = 'default',
  labels,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: 'top' | 'right' | 'bottom' | 'left'
  showCloseButton?: boolean
  /** A side panel's width: sm 384 px, default 448 px, lg 672 px, xl 896 px, full the screen. */
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: SheetContentLabels
}) {
  const { close } = useGoGoUIMessages(labels)
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          // A floating panel: its shadow draws the edge, no border. From a
          // tablet up it stands 8px off the window's edge, rounded.
          'fixed z-50 flex flex-col gap-4 bg-floating text-sm text-fg shadow-lg transition duration-200 ease-tactile data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:rounded-t-3xl data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:data-starting-style:translate-y-10 data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-full data-[side=left]:data-ending-style:-translate-x-10 data-[side=left]:data-starting-style:-translate-x-10 data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-full data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10 data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:rounded-b-3xl data-[side=top]:data-ending-style:-translate-y-10 data-[side=top]:data-starting-style:-translate-y-10 data-[side=left]:sm:inset-y-2 data-[side=left]:sm:left-2 data-[side=left]:sm:h-auto data-[side=left]:sm:rounded-3xl data-[side=right]:sm:inset-y-2 data-[side=right]:sm:right-2 data-[side=right]:sm:h-auto data-[side=right]:sm:rounded-3xl',
          (side === 'left' || side === 'right') &&
            {
              sm: 'sm:max-w-sm',
              default: 'sm:max-w-md',
              lg: 'sm:max-w-2xl',
              xl: 'sm:max-w-4xl',
              full: 'sm:max-w-none sm:inset-x-2',
            }[size],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon"
              />
            }
          >
            <GoGoIcon name="close" aria-hidden="true" />
            <span className="sr-only">{close}</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1 p-6', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-3 p-6', className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-heading text-base font-medium text-fg', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-fg-muted', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
export type { SheetContentLabels }
