import { CaretDownIcon } from '@phosphor-icons/react'
import { expect, userEvent, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible.tsx'

const meta = preview.meta({
  title: 'Mise en page/Collapsible',
  component: Collapsible,
  subcomponents: {
    CollapsibleTrigger,
    CollapsibleContent,
  },
})

/**
 * Rare options kept out of the way until asked for.
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
  // A click shows the options, a second hides them.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: "Plus d'options" })
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText(/Acompte à 30 %/)).toBeVisible()
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
})
