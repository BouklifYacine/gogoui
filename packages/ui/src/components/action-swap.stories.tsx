import {
  CheckIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  StarIcon,
} from '@phosphor-icons/react'

import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { ActionSwap } from './action-swap.tsx'

const meta = preview.meta({
  title: 'Actions/ActionSwap',
  tags: ['beta'],
  component: ActionSwap,
  args: {
    states: [
      { value: 'follow', label: 'Suivre', icon: <PlusIcon /> },
      {
        value: 'following',
        label: 'Suivi',
        icon: <CheckIcon />,
        color: 'success',
      },
    ],
  },
})

/**
 * Follow a request: « Suivre » turns into a green « Suivi », and back.
 */
export const Basic = meta.story({
  // Each press moves to the next state, the last back to the first.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Suivre' }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Suivi' })).toBeVisible(),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Suivi' }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Suivre' })).toBeVisible(),
    )
  },
})

/**
 * The white button.
 */
export const Outline = meta.story({ args: { variant: 'outline' } })

/**
 * Sending, with its words while it runs: « Envoyer » → « Envoi… » →
 * « Envoyé », which goes back to « Envoyer » after 2 s.
 */
export const Send = meta.story({
  args: {
    states: [
      { value: 'idle', label: 'Envoyer', icon: <PaperPlaneTiltIcon /> },
      {
        value: 'sent',
        label: 'Envoyé',
        icon: <CheckIcon />,
        color: 'success',
        pendingLabel: 'Envoi…',
        holdFor: 2000,
      },
    ],
    onAction: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  },
})

/**
 * When the action fails: « Réessayer » on red for 1.8 s, then the state
 * before.
 */
export const Failure = meta.story({
  args: {
    states: [
      {
        value: 'idle',
        label: 'Envoyer la relance',
        icon: <PaperPlaneTiltIcon />,
      },
      { value: 'sent', label: 'Relance envoyée', color: 'success' },
    ],
    onAction: () =>
      new Promise((_, reject) => setTimeout(() => reject(new Error()), 900)),
  },
})

/**
 * Press it: the words morph letter by letter while the width follows; with
 * no words to show while it works, the pill folds into a turning circle,
 * then opens on « Favori » as its star is wiped in.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: {
    states: [
      { value: 'off', label: 'Ajouter aux favoris', icon: <StarIcon /> },
      {
        value: 'on',
        label: 'Favori',
        icon: <StarIcon weight="fill" />,
        color: 'success',
      },
    ],
    onAction: () => new Promise((resolve) => setTimeout(resolve, 800)),
  },
})
