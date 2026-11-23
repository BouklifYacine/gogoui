import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { PasswordField } from './password-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/PasswordField',
  component: PasswordField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Signing up: the strength shows under the field as it is typed.
 */
export const NewPassword = meta.story({
  args: {
    name: 'password',
    label: 'Mot de passe',
    autoComplete: 'new-password',
    minLength: 10,
    error: '',
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <PasswordField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Signing in: no strength, the password exists already.
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

/**
 * The eye: a slash draws itself across it and the text resolves from a
 * light blur. A new error nudges the field once and slides in.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('chênes')
    const [error, setError] = useState<string>()
    return (
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setError(
            value.length < 10
              ? `Encore ${String(10 - value.length)} caractères.`
              : undefined,
          )
        }}
      >
        <PasswordField
          name="password"
          label="Mot de passe"
          autoComplete="new-password"
          error={error}
          value={value}
          onValueChange={setValue}
        />
        <Button type="submit" variant="outline" className="justify-self-start">
          Valider
        </Button>
      </form>
    )
  },
})
