import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { TextMorph } from './text-morph.tsx'

const meta = preview.meta({
  title: 'Texte animé/TextMorph',
  tags: ['beta', 'deprecated'],
  component: TextMorph,
  args: { children: 'Envoyer' },
})

/**
 * A label in its resting state; change the words in the controls.
 */
export const Basic = meta.story({
  args: { className: 'text-lg font-medium' },
})

const steps = ['Envoyer', 'Envoi…', 'Envoyé']

/**
 * Each click morphs the label into the next: the letters both words share
 * glide to their new place, new ones sharpen in, the others blur away, and
 * the width follows on a spring, carrying the button with it.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [index, setIndex] = useState(0)
    return (
      <div className="flex flex-col items-start gap-4">
        <Button
          onClick={() => setIndex((current) => (current + 1) % steps.length)}
        >
          <TextMorph>{steps[index] ?? ''}</TextMorph>
        </Button>
        <p className="text-sm text-fg-muted">
          Format :{' '}
          <TextMorph render={<strong />}>
            {index % 2 ? 'OKLCH' : 'HEX'}
          </TextMorph>
        </p>
      </div>
    )
  },
})
