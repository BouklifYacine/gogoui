import { BellIcon } from '@phosphor-icons/react'

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
})
