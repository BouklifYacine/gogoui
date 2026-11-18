import { StarIcon, TextBIcon, TextItalicIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Toggle } from './toggle.tsx'

const meta = preview.meta({
  title: 'Composants/Toggle',
  component: Toggle,
})

/**
 * Formatting buttons that stay pressed.
 *
 * @summary Buttons that stay pressed.
 */
export const Basic = meta.story({
  render: () => (
    <div className="flex gap-1">
      <Toggle aria-label="Gras" defaultPressed>
        <TextBIcon />
      </Toggle>
      <Toggle aria-label="Italique">
        <TextItalicIcon />
      </Toggle>
    </div>
  ),
})

/**
 * With its word, on a white button.
 *
 * @summary A pressed state with a word.
 */
export const Outline = meta.story({
  render: () => (
    <Toggle variant="outline">
      <StarIcon />
      Favori
    </Toggle>
  ),
})
