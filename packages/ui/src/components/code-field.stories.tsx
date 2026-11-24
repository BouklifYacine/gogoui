import { useState } from 'react'

import preview from '#.storybook/preview'

import { CodeField } from './code-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/CodeField',
  component: CodeField,
})

/**
 * The code received by e-mail: type it, or paste the whole line.
 */
export const Basic = meta.story({
  args: {
    name: 'code',
    label: 'Code reçu par e-mail',
    length: 6,
    status: undefined,
    error: '',
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <CodeField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Refused: red boxes and the reason in words.
 */
export const Refused = meta.story({
  render: function Render() {
    const [value, setValue] = useState('042817')
    return (
      <CodeField
        name="code"
        label="Code reçu par e-mail"
        status="error"
        error="Ce code a expiré. Demandez-en un nouveau."
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
