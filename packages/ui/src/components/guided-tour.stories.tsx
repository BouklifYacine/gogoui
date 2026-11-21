import { useState } from 'react'
import { PlusIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { GuideOffer } from './guide-offer.tsx'
import { GuidedTour } from './guided-tour.tsx'
import type { Guide } from './guided-tour.tsx'

const meta = preview.meta({
  title: 'Composants/GuidedTour',
  component: GuidedTour,
  subcomponents: { GuideOffer },
  parameters: { layout: 'padded' },
})

const guide: Guide = {
  name: 'quotes',
  title: 'créer un devis',
  steps: [
    {
      target: 'quotes-title',
      title: 'Vos devis',
      content: 'Chaque devis envoyé à un couple arrive ici.',
    },
    {
      target: 'new-quote',
      title: 'Un nouveau devis',
      content: 'Cliquez ici pour en créer un.',
      action: true,
    },
  ],
}

/**
 * The offer card, then the guide's bubbles on the page's own elements.
 */
export const Basic = meta.story({
  render: function Render() {
    const [mode, setMode] = useState<'offer' | 'start' | undefined>('offer')
    return (
      <div className="flex flex-col gap-6">
        {mode === 'offer' && (
          <GuideOffer
            title={guide.title}
            steps={guide.steps.length}
            onStart={() => setMode('start')}
            onDecline={() => setMode(undefined)}
          />
        )}
        {mode === 'start' && (
          <GuidedTour guide={guide} onDone={() => setMode(undefined)} />
        )}
        <div className="flex items-center justify-between">
          <h1 data-guide="quotes-title" className="text-2xl font-medium">
            Devis
          </h1>
          <Button data-guide="new-quote">
            <PlusIcon aria-hidden="true" />
            Nouveau devis
          </Button>
        </div>
      </div>
    )
  },
})
