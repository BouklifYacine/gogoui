import preview from '#.storybook/preview'

import { PasswordStrength } from './password-strength.tsx'

const meta = preview.meta({
  title: 'Formulaires/PasswordStrength',
  component: PasswordStrength,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Too short: it counts what is missing.
 *
 * @summary A password too short.
 */
export const TooShort = meta.story({ args: { password: 'mariage' } })

/**
 * A long phrase mixing kinds of characters: very strong.
 *
 * @summary A very strong password.
 */
export const VeryStrong = meta.story({
  args: { password: 'Le-domaine-des-Chênes-2027' },
})
