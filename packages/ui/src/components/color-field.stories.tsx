import { useState } from 'react'

import preview from '#.storybook/preview'

import { ColorField } from './color-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/ColorField',
  component: ColorField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * A colour for a room in the calendar, its name written under the tiles.
 *
 * @summary One colour among tiles.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('#2563eb')
    return (
      <ColorField
        name="color"
        legend="Couleur dans le calendrier"
        options={[
          { value: '#2563eb', label: 'Bleu' },
          { value: '#059669', label: 'Vert' },
          { value: '#d97706', label: 'Ambre' },
          { value: '#dc2626', label: 'Rouge' },
          { value: '#7c3aed', label: 'Violet' },
          { value: '#475569', label: 'Ardoise' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
