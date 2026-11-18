import { useState } from 'react'

import preview from '#.storybook/preview'

import { PasswordField } from './password-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/PasswordField',
  component: PasswordField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Signing up: the strength shows under the field as it is typed.
 *
 * @summary A new password with its strength.
 */
export const NewPassword = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <PasswordField
        name="password"
        label="Mot de passe"
        autoComplete="new-password"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Signing in: no strength, the password exists already.
 *
 * @summary The password to sign in.
 */
export const CurrentPassword = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <PasswordField
        name="current"
        label="Mot de passe"
        autoComplete="current-password"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
