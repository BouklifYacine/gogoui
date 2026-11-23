import preview from '#.storybook/preview'

import { ThemeToggle } from './theme-toggle.tsx'

const meta = preview.meta({
  title: 'Composants/ThemeToggle',
  component: ThemeToggle,
})

/**
 * Light, dark or the device's own; the choice is kept on this device.
 * Here it fights Storybook's own theme switch: use one or the other.
 */
export const Basic = meta.story({})

/**
 * Icons only, for a header.
 */
export const Compact = meta.story({ args: { compact: true } })

/**
 * One button between light and dark, pressed in dark mode.
 */
export const OneButton = meta.story({ args: { variant: 'button' } })

/**
 * The one button, icon only, for a header.
 */
export const OneButtonCompact = meta.story({
  args: { variant: 'button', compact: true },
})

/**
 * Press it: the sun and the moon trade places with a turn, both the same
 * way (clockwise into dark, back out of it), shrinking and blurring a
 * little on the way. Nothing turns on the first paint.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: { variant: 'button', compact: true },
})
