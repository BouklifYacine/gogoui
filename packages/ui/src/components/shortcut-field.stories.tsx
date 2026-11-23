import { useState } from 'react'

import preview from '#.storybook/preview'

import { ShortcutField } from './shortcut-field.tsx'

const meta = preview.meta({
  title: 'Composants/ShortcutField',
  tags: ['beta'],
  component: ShortcutField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A labelled recorder with its help, controlled.
 */
export const Basic = meta.story({
  args: {
    label: 'Ouvrir la recherche',
    description: 'Le raccourci qui ouvre la recherche partout.',
    value: 'mod+k',
    onValueChange: () => undefined,
  },
  render: function Render(args) {
    const [value, setValue] = useState<string | null>(args.value)
    return (
      <ShortcutField
        {...args}
        value={value}
        onValueChange={(next) => setValue(next)}
      />
    )
  },
})

/**
 * Its error, under it and linked to it.
 */
export const Invalid = meta.story({
  args: {
    label: 'Nouvelle demande',
    value: null,
    onValueChange: () => undefined,
    error: 'Choisissez un raccourci.',
  },
})
