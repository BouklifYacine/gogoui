import { useState } from 'react'

import preview from '#.storybook/preview'

import { ColorField } from './color-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/ColorField',
  component: ColorField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * A colour for a room in the calendar, its name written under the tiles.
 */
export const Basic = meta.story({
  args: {
    name: 'color',
    legend: 'Couleur dans le calendrier',
    description: '',
    error: '',
    options: [
      { value: '#2563eb', label: 'Bleu' },
      { value: '#059669', label: 'Vert' },
      { value: '#d97706', label: 'Ambre' },
      { value: '#dc2626', label: 'Rouge' },
      { value: '#7c3aed', label: 'Violet' },
      { value: '#475569', label: 'Ardoise' },
    ],
    value: '#2563eb',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <ColorField
        {...args}
        description={args.description || undefined}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
