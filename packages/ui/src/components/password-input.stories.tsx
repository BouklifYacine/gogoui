import preview from '#.storybook/preview'

import { Label } from './label.tsx'
import { PasswordInput } from './password-input.tsx'

const meta = preview.meta({
  title: 'Composants/PasswordInput',
  component: PasswordInput,
})

/**
 * A sign-in password: the eye shows what was typed. `autoComplete` lets
 * the password manager fill it.
 *
 * @summary A password field with its eye.
 */
export const Basic = meta.story({
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="password">Mot de passe</Label>
      <PasswordInput id="password" autoComplete="current-password" />
    </div>
  ),
})
