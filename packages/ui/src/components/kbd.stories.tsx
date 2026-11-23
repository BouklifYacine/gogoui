import preview from '#.storybook/preview'

import { Kbd, KbdGroup } from './kbd.tsx'

const meta = preview.meta({
  title: 'Composants/Kbd',
  component: Kbd,
})

/**
 * A shortcut written in a sentence.
 */
export const Basic = meta.story({
  args: { children: 'K' },
  render: (args) => (
    <p className="text-sm text-fg-muted">
      Ouvrez la recherche avec{' '}
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd {...args} />
      </KbdGroup>
    </p>
  ),
})

/**
 * Keys held down (`data-pressed`) sink a pixel and light up.
 */
export const Pressed = meta.story({
  render: () => (
    <KbdGroup>
      <Kbd data-pressed="">Ctrl</Kbd>
      <Kbd data-pressed="">Maj</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
})
