import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { ConfirmDialog } from './confirm-dialog.tsx'

const meta = preview.meta({
  title: 'Confirmations/ConfirmDialog',
  component: ConfirmDialog,
})

/**
 * Deleting: the title asks, the description says what is lost, the way
 * out says what it keeps. The button spins while the action runs.
 */
export const Destructive = meta.story({
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Supprimer le devis
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Supprimer le devis n° 42 ?"
          description="Le couple ne pourra plus l'ouvrir. Les paiements reçus restent enregistrés."
          confirmLabel="Supprimer"
          cancelLabel="Garder le devis"
          loadingLabel="Suppression…"
          loading={loading}
          destructive
          onConfirm={() => {
            setLoading(true)
            setTimeout(() => {
              setLoading(false)
              setOpen(false)
            }, 1500)
          }}
        />
      </>
    )
  },
  // Opens with the focus inside; Escape closes it and gives the focus back
  // to the button that opened it.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Supprimer le devis',
    })
    await userEvent.click(trigger)
    const dialog = await page.findByRole('alertdialog', {
      name: 'Supprimer le devis n° 42 ?',
    })
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  },
})

/**
 * The action failed: the reason shows in the dialog, which stays open.
 */
export const WithError = meta.story({
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Envoyer le contrat
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Envoyer le contrat au couple ?"
          description="Il le recevra par e-mail et pourra le signer en ligne."
          confirmLabel="Envoyer"
          error="L'envoi a échoué. Vérifiez votre connexion, puis réessayez."
          onConfirm={() => undefined}
        />
      </>
    )
  },
})
