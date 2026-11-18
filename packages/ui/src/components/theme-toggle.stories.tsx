import preview from '#.storybook/preview'

import { ThemeToggle } from './theme-toggle.tsx'

const meta = preview.meta({
  title: 'Composants/ThemeToggle',
  component: ThemeToggle,
})

/**
 * Light, dark or the device's own; the choice is kept on this device.
 * Here it fights Storybook's own theme switch: use one or the other.
 *
 * @summary Switch the theme.
 */
export const Basic = meta.story({})

/**
 * Icons only, for a header.
 *
 * @summary A compact theme switch.
 */
export const Compact = meta.story({ args: { compact: true } })
