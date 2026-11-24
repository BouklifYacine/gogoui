import * as React from 'react'
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import {
  dialogOverlayMotion,
  dialogPopupMotion,
} from '../internal/dialog-motion.ts'
import { cn } from '../lib/cn.ts'

import { Button } from './button.tsx'

/**
 * A confirmation that must be answered before going on.
 *
 * **Use it for** an action that cannot be undone and needs custom content.
 * **Prefer** `ConfirmDialog` (one call, loading and error included) for the
 * usual « Supprimer ? ». **Not for** a form (`Dialog`).
 *
 * **Where**: opened from the button that triggers the action; centred over
 * the page.
 *
 * **States**: closed, open; a click outside does not close it, Escape does.
 * It comes and goes like `Dialog` (a spring rise, a quicker exit).
 *
 * **Compose**: `AlertDialog` > `AlertDialogTrigger` + `AlertDialogContent` >
 * `AlertDialogHeader` (`AlertDialogTitle`, `AlertDialogDescription`) +
 * `AlertDialogFooter` (`AlertDialogCancel`, then the action).
 *
 * **Accessibility**: `role="alertdialog"`, its title and description read
 * aloud; the focus starts on the safe way out.
 *
 * @summary A confirmation that must be answered; a click outside does not close it.
 */
function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      // Always drawn, even over another dialog or a sheet (Base UI skips a
      // nested dialog's backdrop): without it the panel under a confirmation
      // stays bright and its buttons answer a tap.
      forceRender
      className={cn(
        'fixed inset-0 isolate z-50 bg-overlay backdrop-blur-[6px]',
        dialogOverlayMotion,
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = 'default',
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: 'default' | 'sm'
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          // About 15 % larger than shadcn's: read at arm's length on a
          // phone, the last step before a change.
          'group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl bg-floating p-6 text-fg shadow-lg outline-none data-[size=default]:max-w-[23rem] data-[size=sm]:max-w-[23rem] data-[size=default]:sm:max-w-[440px]',
          // Arc UI's spring entrance, the same as Dialog's.
          dialogPopupMotion,
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        'grid grid-rows-[auto_1fr] place-items-center gap-2 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        // Its buttons 46px tall, with larger words (18.4px).
        '-mx-6 -mb-6 flex flex-col-reverse gap-3 rounded-b-3xl border-t border-line px-6 py-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-full text-fg-muted ring-1 ring-line ring-inset sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        'font-heading text-base font-medium text-fg sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        'text-sm text-balance text-fg-muted md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-fg',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: AlertDialogPrimitive.Close.Props &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
