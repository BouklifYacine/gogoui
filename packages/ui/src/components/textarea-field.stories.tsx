import { useState } from 'react'

import preview from '#.storybook/preview'

import { TextareaField } from './textarea-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/TextareaField',
  component: TextareaField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Notes of several lines.
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

/**
 * The counter's digits roll as you type, and the help and error slide in
 * under the field (FieldShell).
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('Bonjour Léa et Hugo,')
    return (
      <TextareaField
        name="message"
        label="Message au couple"
        maxLength={120}
        error={value.length > 100 ? 'Restez sous 100 caractères.' : undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
