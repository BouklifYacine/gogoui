import { useState } from 'react'

import preview from '#.storybook/preview'

import { TextareaField } from './textarea-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/TextareaField',
  component: TextareaField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Notes of several lines.
 *
 * @summary A labelled text of several lines.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <TextareaField
        name="notes"
        label="Notes"
        description="Visibles par votre équipe seulement."
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
