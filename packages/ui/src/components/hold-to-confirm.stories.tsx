import { useState } from 'react'
import { ImageIcon, TrashIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { HoldToConfirm } from './hold-to-confirm.tsx'

const meta = preview.meta({
  title: 'Composants/HoldToConfirm',
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
