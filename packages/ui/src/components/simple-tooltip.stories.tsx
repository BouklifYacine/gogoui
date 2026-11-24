import { BellIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { SimpleTooltip } from './simple-tooltip.tsx'

const meta = preview.meta({
  title: 'Fenêtres/SimpleTooltip',
  component: SimpleTooltip,
})

/**
 * One line around an icon button; change its words and side in the
 * controls.
 */
export const Basic = meta.story({
  args: {
    content: 'Notifications',
    side: 'top',
    delay: 0,
    children: (
      <Button variant="soft" size="icon" aria-label="Notifications">
        <BellIcon />
      </Button>
    ),
  },
})
