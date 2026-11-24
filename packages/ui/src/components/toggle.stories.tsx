import { StarIcon, TextBIcon, TextItalicIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Toggle } from './toggle.tsx'

const meta = preview.meta({
  title: 'Actions/Toggle',
  component: Toggle,
  args: { variant: 'outline', size: 'default', color: 'primary' },
})

/**
 * With its word: change its shape, size and colour in the controls.
 */
export const Basic = meta.story({
  args: {
    defaultPressed: true,
    children: (
      <>
        <StarIcon />
        Favori
      </>
    ),
  },
})

/**
 * Formatting buttons, icons alone, each named for a screen reader.
 */
export const Icons = meta.story({
  render: (args) => (
    <div className="flex gap-1">
      <Toggle {...args} aria-label="Gras" defaultPressed>
        <TextBIcon />
      </Toggle>
      <Toggle {...args} aria-label="Italique">
        <TextItalicIcon />
      </Toggle>
    </div>
  ),
})
