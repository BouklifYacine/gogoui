import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { RollingLine } from './rolling-line.tsx'

const meta = preview.meta({
  title: 'Composants/RollingLine',
  component: RollingLine,
})

const words = ['En attente', 'Envoi en cours', 'Envoyé']

/**
 * A status that rolls to its next words.
 */
export const Basic = meta.story({
  render: function Render() {
    const [index, setIndex] = useState(0)
    return (
      <div className="flex w-60 flex-col gap-3">
        <RollingLine text={words[index] ?? ''} className="font-medium" />
        <Button
          variant="outline"
          onClick={() => setIndex((current) => (current + 1) % words.length)}
        >
          Suivant
        </Button>
      </div>
    )
  },
})
