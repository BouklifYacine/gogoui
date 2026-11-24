import { BellIcon } from '@phosphor-icons/react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip.tsx'

const meta = preview.meta({
  title: 'Fenêtres/Tooltip',
  component: Tooltip,
  subcomponents: {
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
  },
})

/**
 * The name of an icon button, on hover or keyboard focus. The button keeps
 * its own `aria-label`: a tooltip is never the only name.
 */
export const Basic = meta.story({
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="soft" size="icon" aria-label="Notifications" />
          }
        >
          <BellIcon />
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  // The keyboard focus shows the tooltip; Escape hides it and the focus
  // stays on the button.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Notifications',
    })
    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    // The button's name is an aria-label: the only « Notifications » text
    // on the page is the tooltip's.
    const tooltip = await page.findByText('Notifications')
    await waitFor(() => expect(tooltip).toBeVisible())
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByText('Notifications')).not.toBeInTheDocument(),
    )
    await expect(trigger).toHaveFocus()
  },
})
