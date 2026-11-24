import { useState } from 'react'

import preview from '#.storybook/preview'

import { Input } from './input.tsx'
import { PasswordStrength } from './password-strength.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/PasswordStrength',
  component: PasswordStrength,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Too short: it counts what is missing.
 */
export const TooShort = meta.story({ args: { password: 'mariage' } })

/**
 * A long phrase mixing kinds of characters: very strong.
 */
export const VeryStrong = meta.story({
  args: { password: 'Le-domaine-des-Chênes-2027' },
})

/**
 * Type to watch it: each bar's fill slides into its track (left to right
 * as it improves, right to left as it falls), the word rises or drops, a
 * condition met tints its mark and draws its tick, and « encore N »
 * rolls.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [password, setPassword] = useState('mariage')
    return (
      <div className="grid gap-3">
        <Input
          aria-label="Mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordStrength password={password} />
      </div>
    )
  },
})

/**
 * Its own list: the bars still follow GoGoUI's score, the ticks your
 * rules (here, no part of the e-mail).
 */
export const CustomRules = meta.story({
  args: {
    password: 'lea.martin-2027',
    rules: [
      {
        id: 'min',
        label: 'Au moins 12 caractères',
        test: (password: string) => password.length >= 12,
        remaining: (password: string) => 12 - password.length,
      },
      {
        id: 'email',
        label: 'Sans votre adresse e-mail',
        test: (password: string) => !password.includes('lea.martin'),
      },
    ],
  },
})
