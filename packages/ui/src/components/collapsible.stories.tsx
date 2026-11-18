import { CaretDownIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible.tsx'

const meta = preview.meta({
  title: 'Composants/Collapsible',
  component: Collapsible,
})

/**
 * Rare options kept out of the way until asked for.
 *
 * @summary A section shown on demand.
 */
export const Basic = meta.story({
  render: () => (
    <Collapsible className="w-72">
      <CollapsibleTrigger render={<Button variant="ghost" />}>
        Plus d'options
        <CaretDownIcon data-icon="inline-end" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 text-sm text-fg-muted">
        Acompte à 30 %, solde 30 jours avant la date.
      </CollapsibleContent>
    </Collapsible>
  ),
})
