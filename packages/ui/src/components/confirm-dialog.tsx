import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog.tsx'
import { Button } from './button.tsx'
import { ErrorAlert } from './error-alert.tsx'
import { SlideToConfirm } from './slide-to-confirm.tsx'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** What happens, and what stays: the person decides knowing it. */
  description: ReactNode
  confirmLabel: string
  /** The safe way out, best saying what it keeps (« Garder le devis »). */
  cancelLabel?: string
  /** On the button while the action runs (« Suppression… »). */
  loadingLabel?: string
  loading?: boolean
  /** In red: the action deletes or stops something. */
  destructive?: boolean
  /** Why the action failed, shown in the dialog, where the person still is. */
  error?: string | null
  onConfirm: () => void
  /**
   * For money that leaves for good: the yes is a slide (« Glissez pour
   * retenir 350 € ») rather than a button a slip can press. Its promise
   * keeps the spinner up; `onConfirm` is then not used.
   */
  slide?: {
    label: string
    doneLabel: string
    run: () => Promise<unknown>
  }
  /**
   * Where the focus goes when the dialog closes, when the button that
   * opened it may be gone (its row deleted): a stable element, such as the
   * section's title.
   */
  finalFocus?: () => HTMLElement | true
}

/**
 * Asks before an action that cannot be undone.
 *
 * **Use it for** deleting, sending, stopping, taking money. **Prefer**
 * acting at once with an « Annuler » toast (`useToastWithUndo`) when the
 * action can be undone.
 *
 * **Where**: opened by the button of the action (a `destructive` button,
 * a menu item).
 *
 * **States**: closed, open, loading (button spins, dialog stays), error
 * (shown inside), slide to confirm (money).
 *
 * **Key props**: `open` + `onOpenChange`, `title` (a question),
 * `description` (what is lost, what stays), `confirmLabel`, `cancelLabel`
 * (say what it keeps: « Garder le devis »), `destructive`, `loading` +
 * `loadingLabel`, `error`, `slide`, `finalFocus`.
 *
 * **Accessibility**: an alert dialog; the focus starts on the safe way out.
 *
 * @summary Asks before an action that cannot be undone.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loadingLabel,
  loading = false,
  destructive = false,
  error,
  onConfirm,
  slide,
  finalFocus,
}: ConfirmDialogProps) {
  const { cancel } = useGoGoUIMessages()

  if (slide) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent finalFocus={finalFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {error && <ErrorAlert>{error}</ErrorAlert>}
          <AlertDialogFooter className="flex-col sm:flex-col">
            <SlideToConfirm
              label={slide.label}
              confirmingLabel={(loadingLabel ?? confirmLabel).replace(/…$/, '')}
              doneLabel={slide.doneLabel}
              destructive={destructive}
              onConfirm={slide.run}
            />
            <AlertDialogCancel>{cancelLabel ?? cancel}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent finalFocus={finalFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <ErrorAlert>{error}</ErrorAlert>}
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel ?? cancel}</AlertDialogCancel>
          <Button
            variant={destructive ? 'danger' : 'default'}
            loading={loading}
            loadingText={loadingLabel}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
export type { ConfirmDialogProps }
