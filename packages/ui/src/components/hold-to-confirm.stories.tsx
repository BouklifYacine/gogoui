import { useState } from 'react'
import { ImageIcon, TrashIcon } from '@phosphor-icons/react'
import { expect, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { HoldToConfirm } from './hold-to-confirm.tsx'

const meta = preview.meta({
  title: 'Confirmations/HoldToConfirm',
  tags: ['beta'],
  component: HoldToConfirm,
})

/**
 * Hold it, or focus it and hold Space or Enter. Let go early and the fill
 * springs back.
 */
export const Basic = meta.story({
  args: {
    label: 'Maintenir pour archiver',
    doneLabel: 'Archivé',
    onConfirm: () => undefined,
  },
})

/**
 * `color="danger"` for what cannot be undone, with its icon.
 */
export const Danger = meta.story({
  args: {
    label: 'Maintenir pour supprimer la photo',
    doneLabel: 'Photo supprimée',
    color: 'danger',
    iconStart: <TrashIcon />,
    onConfirm: () => undefined,
  },
})

/**
 * `onConfirm` returns a promise: the button turns busy with
 * `confirmingLabel`, then done; a refusal rewinds it.
 */
export const Async = meta.story({
  args: {
    label: 'Maintenir pour supprimer la ressource',
    confirmingLabel: 'Suppression',
    doneLabel: 'Ressource supprimée',
    color: 'danger',
    iconStart: <TrashIcon />,
    onConfirm: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  },
})

/**
 * Three sizes, as Button's.
 */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <HoldToConfirm
          key={size}
          size={size}
          label="Maintenir pour retirer"
          doneLabel="Retiré"
          iconStart={<ImageIcon />}
          onConfirm={() => undefined}
        />
      ))}
    </div>
  ),
})

/**
 * `onHoldChange` shows a hint while it is held; `confirmed` and a reset
 * button bring it back.
 */
export const Controlled = meta.story({
  render: function Render() {
    const [holding, setHolding] = useState(false)
    const [confirmed, setConfirmed] = useState(false)
    return (
      <div className="flex flex-col items-start gap-3">
        <HoldToConfirm
          label="Maintenir pour supprimer"
          doneLabel="Supprimé"
          color="danger"
          iconStart={<TrashIcon />}
          confirmed={confirmed}
          onConfirm={() => setConfirmed(true)}
          onHoldChange={setHolding}
        />
        <p className="text-sm text-fg-muted" aria-live="polite">
          {holding ? 'Continuez d’appuyer…' : ' '}
        </p>
        <Button variant="outline" size="sm" onClick={() => setConfirmed(false)}>
          Remettre à zéro
        </Button>
      </div>
    )
  },
})

/**
 * Several buttons with the same words, one per photo: `srLabel` names each
 * one for a screen reader, « Retirer la photo 2 ». A `confirmingLabel`
 * already ending with « … » keeps its own dots. A screen reader's double
 * tap confirms at once, VoiceOver's too (its click carries `detail` 1,
 * after a press with no contact area).
 */
export const SharedWords = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {[1, 2, 3].map((photo) => (
        <HoldToConfirm
          key={photo}
          size="sm"
          label="Retirer"
          srLabel={`Retirer la photo ${photo}`}
          confirmingLabel="Retrait…"
          doneLabel="Retirée"
          color="danger"
          iconStart={<ImageIcon />}
          onConfirm={() => new Promise((resolve) => setTimeout(resolve, 600))}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const second = canvas.getByRole('button', { name: 'Retirer la photo 2' })
    // VoiceOver on iOS: a press with no contact area, then a real click.
    const press = { bubbles: true, isPrimary: true, width: 0, height: 0 }
    second.dispatchEvent(new PointerEvent('pointerdown', press))
    second.dispatchEvent(new PointerEvent('pointerup', press))
    second.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
    await waitFor(() =>
      expect(second).toHaveAttribute('aria-label', 'Retrait…'),
    )
    await waitFor(
      () => expect(second).toHaveAttribute('aria-label', 'Retirée'),
      { timeout: 3000 },
    )
    await expect(
      canvas.getByRole('button', { name: 'Retirer la photo 3' }),
    ).toHaveAttribute('data-state', 'idle')
  },
})

/**
 * Disabled: it does not fill.
 */
export const Disabled = meta.story({
  args: {
    label: 'Maintenir pour supprimer',
    doneLabel: 'Supprimé',
    disabled: true,
    onConfirm: () => undefined,
  },
})

/**
 * The fill follows the hold linearly and springs back when let go; it
 * sinks slightly while pressed; once full, the icon turns into a drawn
 * tick and the words rise into the done state as the width follows.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <HoldToConfirm
        label="Maintenir pour supprimer"
        confirmingLabel="Suppression"
        doneLabel="Supprimé"
        color="danger"
        iconStart={<TrashIcon />}
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 900))}
      />
      <HoldToConfirm
        label="Maintenir pour publier"
        doneLabel="Publié"
        onConfirm={() => undefined}
      />
    </div>
  ),
})
