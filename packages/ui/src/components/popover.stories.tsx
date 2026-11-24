import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover.tsx'

const meta = preview.meta({
  title: 'Fenêtres/Popover',
  component: Popover,
  subcomponents: {
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverDescription,
  },
})

/**
 * A short detail next to what it explains, closed by a click outside.
 */
export const Basic = meta.story({
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Conditions d'annulation
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Annulation</PopoverTitle>
          <PopoverDescription>
            L'acompte est rendu jusqu'à 90 jours avant la date.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  // Opens on a click with its title; Escape closes it and gives the focus
  // back to its button.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: "Conditions d'annulation",
    })
    await userEvent.click(trigger)
    const popover = await page.findByRole('dialog', { name: 'Annulation' })
    // It fades in, even with motion off: wait for it.
    await waitFor(() => expect(popover).toBeVisible())
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  },
})
