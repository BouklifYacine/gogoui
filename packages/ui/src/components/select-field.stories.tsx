import { useState } from 'react'

import preview from '#.storybook/preview'

import { SelectField } from './select-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/SelectField',
  component: SelectField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

const sources = [
  { value: 'website', label: 'Site internet' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'word-of-mouth', label: 'Bouche-à-oreille' },
  { value: 'fair', label: 'Salon du mariage' },
] as const

/**
 * One choice among a list too long to show at once.
 *
 * @summary A labelled list to pick from.
 */
export const Basic = meta.story({
  args: {
    name: 'source',
    label: 'Comment vous ont-ils connu ?',
    description: '',
    error: '',
    placeholder: 'Choisir',
    required: false,
    size: 'default',
    options: sources,
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <SelectField
        {...args}
        description={args.description || undefined}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
