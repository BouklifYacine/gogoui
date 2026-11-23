import { useState } from 'react'
import { ArrowRightIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { COLORS } from '../internal/colors.ts'

import { Button } from './button.tsx'

const meta = preview.meta({
  title: 'Composants/Button',
  component: Button,
  args: { children: 'Enregistrer' },
})

/**
 * The single main action of a view: one per screen, so the eye knows
 * where to go.
 */
export const Basic = meta.story({})

/**
 * Every action other than the main one: « Annuler », « Exporter »,
 * « Modifier ». Next to a `default` button, it stays on its left.
 */
export const Outline = meta.story({
  args: { variant: 'outline', children: 'Annuler' },
})

/**
 * A quiet action that must not compete with the content: « Voir tout »
 * at the end of a list, an option in a toolbar.
 */
export const Ghost = meta.story({
  args: { variant: 'ghost', children: 'Voir tout' },
})

/**
 * `destructive` opens the confirmation from a list; `danger` confirms it
 * in the dialog. Never delete on the first click.
 */
export const Destructive = meta.story({
  render: () => (
    <div className="flex gap-3">
      <Button variant="destructive">
        <TrashIcon data-icon="inline-start" />
        Supprimer
      </Button>
      <Button variant="danger">Supprimer définitivement</Button>
    </div>
  ),
})

/**
 * While a request runs: the spinner shows, the click is blocked, the focus
 * stays on the button for a screen reader. `loadingText` says what happens.
 */
export const Loading = meta.story({
  args: { loading: true, loadingText: 'Enregistrement…' },
})

/**
 * An icon alone needs an `aria-label`: a screen reader has nothing else to
 * read. 36px at a desk, 44px under a thumb.
 */
export const IconOnly = meta.story({
  args: {
    size: 'icon',
    variant: 'outline',
    'aria-label': 'Ajouter',
    children: <PlusIcon />,
  },
})

/**
 * An icon before or after the word: mark it `data-icon="inline-start"` or
 * `"inline-end"` so the padding on that side tightens.
 */
export const WithIcon = meta.story({
  args: {
    children: 'Continuer',
    iconEnd: <ArrowRightIcon />,
  },
})

/**
 * To navigate, render a link with the button's look: the page keeps a real
 * `<a>`, opened in a new tab with a middle click.
 */
export const AsLink = meta.story({
  args: {
    variant: 'outline',
    render: <a href="#factures" />,
    nativeButton: false,
    children: 'Voir les factures',
  },
})

/**
 * The row actions of a list, told apart by colour as well as by their
 * word: change (info), set aside (warning), bring back (success).
 */
export const RowActions = meta.story({
  render: () => (
    <div className="flex gap-2">
      <Button size="sm" variant="info">
        Modifier
      </Button>
      <Button size="sm" variant="warning">
        Archiver
      </Button>
      <Button size="sm" variant="success">
        Restaurer
      </Button>
    </div>
  ),
})

/**
 * A button that cannot act yet. Prefer explaining why next to it: a
 * disabled button alone does not say what is missing.
 */
export const Disabled = meta.story({
  args: { disabled: true },
})

/**
 * Every shape (`variant`) in every colour (`color`): the colours come
 * from the tokens, so a brand change follows.
 */
export const Colors = meta.story({
  render: () => (
    <div className="grid gap-3">
      {(['solid', 'subtle', 'outline', 'ghost', 'link'] as const).map(
        (variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-2">
            {COLORS.map((color) => (
              <Button key={color} variant={variant} color={color}>
                Valider
              </Button>
            ))}
          </div>
        ),
      )}
    </div>
  ),
})

/**
 * Press it: it squeezes quickly (.97, .96 for an icon alone). When its
 * words change, the new ones rise into place as the old ones fade.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [copied, setCopied] = useState(false)
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setCopied((done) => !done)}>
          {copied ? 'Lien copié' : 'Copier le lien'}
        </Button>
        <Button variant="soft" size="icon" aria-label="Ajouter">
          <PlusIcon />
        </Button>
      </div>
    )
  },
})
