import { useCallback } from 'react'
import { Toaster as Sonner, toast } from 'sonner'
import type { ToasterProps } from 'sonner'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'

/**
 * Short confirmations at the top of the screen.
 *
 * **Use it for** « Devis envoyé », « Copié », a background failure. **Not
 * for** an error to fix in a form (`ErrorAlert`) or anything to read
 * later (`Alert`).
 *
 * **Where**: mount `<Toaster />` once in the app's root; call
 * `toast.success('…')`, `toast.error`, `toast.loading`, `toast.promise`
 * anywhere. `useToastWithUndo()` gives `(message, undo)` for a deletion
 * that can be undone.
 *
 * **States**: success, error, warning, info, loading, with an action.
 *
 * **Accessibility**: read aloud politely; it stays 10 s when it carries
 * « Annuler ».
 *
 * @summary Short confirmations at the top of the screen.
 */
function Toaster(props: ToasterProps) {
  const { notifications, closeNotification } = useGoGoUIMessages()

  return (
    <Sonner
      position="top-center"
      // Long enough to read slowly; hovering keeps it open.
      duration={6000}
      closeButton
      containerAriaLabel={notifications}
      icons={{
        success: (
          <GoGoIcon
            name="success"
            weight="fill"
            className="size-4.5 text-success"
          />
        ),
        error: (
          <GoGoIcon
            name="danger"
            weight="fill"
            className="size-4.5 text-danger"
          />
        ),
        warning: (
          <GoGoIcon
            name="warning"
            weight="fill"
            className="size-4.5 text-warning"
          />
        ),
        info: (
          <GoGoIcon name="info" weight="fill" className="size-4.5 text-info" />
        ),
        loading: (
          <GoGoIcon
            name="loading"
            className="size-4.5 animate-spin text-fg-muted motion-reduce:animate-none"
          />
        ),
        close: <GoGoIcon name="close" className="size-3.5" />,
      }}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: closeNotification,
        classNames: {
          // Behind the front toast of a folded stack, only its edge shows.
          toast:
            'flex w-full items-center gap-3 rounded-xl bg-floating py-3 pr-2 pl-4 text-sm text-fg shadow-menu data-[expanded=false]:data-[front=false]:*:opacity-0',
          icon: 'flex size-5 shrink-0 items-center justify-center',
          content: 'flex min-w-0 flex-1 flex-col gap-0.5 py-1',
          title: 'font-medium text-fg',
          description: 'text-fg-muted',
          actionButton:
            'h-8 shrink-0 rounded-lg bg-control px-3 text-sm font-medium text-fg shadow-button transition-colors duration-150 outline-none hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus max-md:h-11',
          cancelButton:
            'h-8 shrink-0 rounded-lg px-3 text-sm font-medium text-fg-muted transition-colors duration-150 hover:bg-hover hover:text-fg max-md:h-11',
          // Sonner puts it first: `order-last` sends it to the line's end.
          closeButton:
            'order-last flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-subtle transition-colors duration-150 outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-line-focus max-md:size-11',
        },
      }}
      {...props}
    />
  )
}

/**
 * A reversible action is done at once, then its toast offers « Annuler »
 * for ten seconds (archiving a client, a quote).
 *
 * @summary Show a toast with an « Annuler » button.
 */
function useToastWithUndo() {
  const { undo: undoWord } = useGoGoUIMessages()
  return useCallback(
    (message: string, undo: () => void) => {
      toast.success(message, {
        duration: 10_000,
        action: { label: undoWord, onClick: undo },
      })
    },
    [undoWord],
  )
}

export { Toaster, toast, useToastWithUndo }
