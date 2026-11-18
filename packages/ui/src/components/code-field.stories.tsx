import { useState } from 'react'

import preview from '#.storybook/preview'

import { CodeField } from './code-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/CodeField',
  component: CodeField,
})

/**
 * The code received by e-mail: type it, or paste the whole line.
 *
 * @summary A sign-in code.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <CodeField
        name="code"
        label="Code reçu par e-mail"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Refused: red boxes and the reason in words.
 *
 * @summary A refused code.
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
