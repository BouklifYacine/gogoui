import preview from '#.storybook/preview'

import { CopyButton } from './copy-button.tsx'

const meta = preview.meta({
  title: 'Actions/CopyButton',
  component: CopyButton,
})

/**
 * Copies a text with its default words (« Copier », then « Copié »).
 */
export const Basic = meta.story({
  args: { text: 'GOGO-2026' },
})

/**
 * Its own word, saying what is copied.
 */
export const CopyLink = meta.story({
  args: {
    text: 'https://example.com/r/domaine-des-chenes',
    label: 'Copier le lien',
    copiedLabel: 'Lien copié',
  },
})

/**
 * Bare, beside a code in a block.
 */
export const Ghost = meta.story({
  args: { text: 'npm i @gogoui/ui', variant: 'ghost', size: 'sm' },
})

/**
 * The icon alone; its name stays « Copier ».
 */
export const IconOnly = meta.story({
  args: { text: 'GOGO-2026', size: 'icon-sm' },
})

/**
 * Copy twice: the icon shrinks away, a tick draws itself (again on each
 * copy) and « Copié » rises in its place, the button keeping its width.
 * Refused by the browser, it shows a red alert and « Échec ».
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: { text: 'https://example.com/r/domaine-des-chenes' },
})
