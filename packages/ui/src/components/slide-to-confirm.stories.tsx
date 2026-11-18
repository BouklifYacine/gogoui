import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { ConfirmDialog } from './confirm-dialog.tsx'
import { SlideToConfirm } from './slide-to-confirm.tsx'

const meta = preview.meta({
  title: 'Composants/SlideToConfirm',
  component: SlideToConfirm,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * Slide the thumb to the end, or focus it and press Enter.
 *
 * @summary Slide to confirm.
 */
export const Basic = meta.story({
  args: {
    label: 'Glissez pour retenir 350,00 €',
    confirmingLabel: 'Enregistrement',
    doneLabel: 'Retenue enregistrée',
    onConfirm: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  },
})

/**
 * In red: the action takes something away.
 *
 * @summary A destructive slide.
 */
export const Destructive = meta.story({
  args: {
    label: 'Glissez pour rembourser 1 500 €',
    confirmingLabel: 'Remboursement',
    doneLabel: 'Remboursé',
    destructive: true,
    onConfirm: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  },
})

/**
 * In a confirmation dialog, for money that leaves for good.
 *
 * @summary A confirmation by slide.
 */
export const InConfirmDialog = meta.story({
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Retenir sur la caution
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Retenir 350,00 € sur la caution ?"
          description="La somme est prélevée sur la carte du couple. Elle ne peut pas être rendue d'ici."
          confirmLabel="Retenir"
          loadingLabel="Retenue…"
          destructive
          onConfirm={() => undefined}
          slide={{
            label: 'Glissez pour retenir 350,00 €',
            doneLabel: 'Retenue enregistrée',
            run: () => new Promise((resolve) => setTimeout(resolve, 1200)),
          }}
        />
      </>
    )
  },
})
