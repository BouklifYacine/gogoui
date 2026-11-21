import preview from '#.storybook/preview'

import { CopyButton } from './copy-button.tsx'

const meta = preview.meta({
  title: 'Composants/CopyButton',
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
