import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { ComponentProps } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import {
  dialogOverlayMotion,
  dialogPopupMotion,
} from '../internal/dialog-motion.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'

/**
 * A modal window over the page.
 *
 * **Use it for** a short form or a decision that needs the person's full
 * attention. **Prefer** `Sheet` for a long form or details, `ConfirmDialog`
 * for « Supprimer ? », the page itself for anything long.
 *
 * **Where**: opened by a button; centred.
 *
 * **States**: closed, open; Escape and the × close it. It rises 8px and
 * grows from .96 on a spring (Arc UI), its veil fading in; it leaves
 * quicker and quieter. Still under reduced motion.
 *
 * **Key props** (on `DialogContent`): `size` (sm, default, lg, xl, full),
 * `showCloseButton`; `DialogFooter showCloseButton` adds « Fermer ».
 *
 * **Compose**: `Dialog` > `DialogTrigger` + `DialogContent` > `DialogHeader`
 * (`DialogTitle`, `DialogDescription`) + body + `DialogFooter` (main action
 * last).
 *
 * **Accessibility**: always a `DialogTitle`; the focus is trapped and comes
 * back to the trigger.
 *
 * @summary A modal window; always give it a DialogTitle.
 */
function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * Opens the dialog. Render your own button with
 * `render={<Button variant="outline" />}`.
 *
 * @summary The element that opens the dialog.
 */
function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/** @summary Moves the dialog to the end of the body. Used by DialogContent. */
function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * Closes the dialog: a « Annuler » in the footer,
 * `render={<Button variant="outline" />}`.
 *
 * @summary Any element that closes the dialog.
 */
function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/** @summary The blurred veil behind the dialog. Used by DialogContent. */
function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-overlay backdrop-blur-[6px]',
        dialogOverlayMotion,
        className,
      )}
      {...props}
    />
  )
}

type DialogContentProps = DialogPrimitive.Popup.Props & {
  /** The round × in the corner. Hide it only when the footer has a way out. */
  showCloseButton?: boolean
  /** Its width: sm 384 px, default 440 px, lg 672 px, xl 896 px, full the screen. */
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
}

/**
 * The window itself, 440px wide at most, centred, with its veil and its ×.
 *
 * @summary The dialog's window, its veil and its close button.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = 'default',
  ...props
}: DialogContentProps) {
  const { close } = useGoGoUIMessages()
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          'data-[size=sm]:sm:max-w-sm data-[size=lg]:sm:max-w-2xl data-[size=xl]:sm:max-w-4xl data-[size=full]:max-h-[calc(100dvh-2rem)] data-[size=full]:overflow-y-auto data-[size=full]:sm:h-[calc(100dvh-2rem)] data-[size=full]:sm:max-w-[calc(100%-2rem)]',
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl bg-floating p-6 text-sm text-fg shadow-lg outline-none sm:max-w-[440px]',
          dialogPopupMotion,
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon-sm"
              />
            }
          >
            <GoGoIcon name="close" />
            <span className="sr-only">{close}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

/** @summary Groups the title and the description at the top. */
function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

type DialogFooterProps = ComponentProps<'div'> & {
  /** Adds a « Fermer » button (in the provider's language) after the actions. */
  showCloseButton?: boolean
}

/**
 * The actions, on a band under a hairline: stacked on a phone, the main
 * one on top; in a row on a computer, the main one on the right.
 *
 * @summary The dialog's actions, main action last.
 */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: DialogFooterProps) {
  const { close } = useGoGoUIMessages()
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        '-mx-6 -mb-6 flex flex-col-reverse gap-3 rounded-b-3xl border-t border-line px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          {close}
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

/** @summary The dialog's name, read first by a screen reader. Required. */
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-heading text-base font-medium text-fg', className)}
      {...props}
    />
  )
}

/** @summary One or two sentences under the title: what happens and why. */
function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-sm text-fg-muted *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-fg',
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
export type { DialogContentProps, DialogFooterProps }
