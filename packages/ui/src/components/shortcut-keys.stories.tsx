import preview from '#.storybook/preview'

import { ShortcutKeys } from './shortcut-keys.tsx'

const meta = preview.meta({
  title: 'Composants/ShortcutKeys',
  tags: ['beta'],
  component: ShortcutKeys,
})

/**
 * A shortcut as key caps, the visitor's platform's way, read in full by a
 * screen reader.
 */
export const Basic = meta.story({
  args: { shortcut: 'mod+shift+k' },
})

/**
 * The same shortcut on a Mac and elsewhere, at both sizes.
 */
export const Platforms = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      <ShortcutKeys shortcut="mod+shift+k" platform="mac" />
      <ShortcutKeys shortcut="mod+shift+k" platform="other" />
      <ShortcutKeys shortcut="mod+enter" platform="mac" size="sm" />
      <ShortcutKeys shortcut="mod+enter" platform="other" size="sm" />
    </div>
  ),
})

/**
 * Keys held down (`pressed`) sink a pixel and light up.
 */
export const Pressed = meta.story({
  args: {
    shortcut: 'mod+shift+k',
    platform: 'other',
    pressed: new Set(['ctrl', 'shift']),
  },
})
