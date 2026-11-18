import preview from '#.storybook/preview'

import { Kbd, KbdGroup } from './kbd.tsx'

const meta = preview.meta({
  title: 'Composants/Kbd',
  component: Kbd,
})

/**
 * A shortcut written in a sentence.
 *
 * @summary A keyboard shortcut in a text.
 */
export const Basic = meta.story({
  render: () => (
    <p className="text-sm text-fg-muted">
      Ouvrez la recherche avec{' '}
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </p>
  ),
})
