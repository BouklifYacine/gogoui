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
  args: {
    name: 'notes',
    label: 'Notes',
    description: 'Visibles par votre équipe seulement.',
    error: '',
    rows: 4,
    maxLength: 280,
    disabled: false,
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <TextareaField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
