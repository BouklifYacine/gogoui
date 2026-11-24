import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { PhoneField, phoneStatus } from './phone-field.tsx'
import type { PhoneValueDetails } from './phone-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/PhoneField',
  tags: ['beta'],
  component: PhoneField,
  decorators: [(Story) => <div className="w-80 pb-80">{Story()}</div>],
})

/**
 * A phone in France by default: the number takes its shape as it is typed,
 * and the value comes with its E.164 form.
 */
export const Basic = meta.story({
  args: {
    label: 'Téléphone',
    description: 'Pour vous joindre au sujet de la date.',
    error: '',
    required: false,
    size: 'default',
    defaultCountry: 'FR',
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    const [details, setDetails] = useState<PhoneValueDetails | null>(null)
    return (
      <div className="grid gap-3">
        <PhoneField
          {...args}
          error={args.error || undefined}
          value={value}
          onValueChange={(next, more) => {
            setValue(next)
            setDetails(more)
          }}
        />
        <code className="text-xs text-fg-muted">
          {value || '—'} · {details?.e164 || '—'} · {details?.status ?? 'empty'}
        </code>
      </div>
    )
  },
})

/**
 * A number kept from before, without its code: it is read in France.
 */
export const Filled = meta.story({
  render: function Render() {
    const [value, setValue] = useState('06 12 34 56 78')
    return (
      <PhoneField
        label="Téléphone du client"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Only a few countries, France and Belgium suggested first.
 */
export const FewCountries = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <PhoneField
        label="Téléphone"
        value={value}
        onValueChange={setValue}
        countries={['FR', 'BE', 'CH', 'ES', 'IT', 'DE', 'GB', 'PT', 'NL']}
        preferredCountries={['FR', 'BE']}
      />
    )
  },
})

/**
 * The form decides the error, here with `phoneStatus()` after leaving the
 * field.
 */
export const Invalid = meta.story({
  render: function Render() {
    const [value, setValue] = useState('+33 6 12')
    const [left, setLeft] = useState(true)
    return (
      <PhoneField
        label="Téléphone"
        required
        value={value}
        onValueChange={setValue}
        onBlur={() => setLeft(true)}
        error={
          left && phoneStatus(value) !== 'valid'
            ? 'Saisissez un numéro complet, par exemple 06 12 34 56 78.'
            : undefined
        }
      />
    )
  },
})

/**
 * The country list with the keyboard alone: the button opens it with the
 * focus in the search, the arrows move, Enter picks and goes back to the
 * number, Escape closes it and gives the focus back to the button. On a
 * phone, a tap on a country picks it; the close and clear buttons are
 * 44 px there.
 */
export const KeyboardCountry = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <PhoneField label="Téléphone" value={value} onValueChange={setValue} />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /France/ })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    const search = canvas.getByRole('combobox', {
      name: 'Rechercher un pays ou un indicatif',
    })
    await expect(search).toHaveFocus()
    await userEvent.keyboard('belg')
    await userEvent.keyboard('{Enter}')
    await expect(
      canvas.getByRole('button', { name: /Belgique/ }),
    ).toHaveAttribute('aria-expanded', 'false')
    await expect(
      canvas.getByRole('textbox', { name: 'Téléphone' }),
    ).toHaveFocus()

    canvas.getByRole('button', { name: /Belgique/ }).focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(search).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    const back = canvas.getByRole('button', { name: /Belgique/ })
    await expect(back).toHaveFocus()
    await expect(back).toHaveAttribute('aria-expanded', 'false')
  },
})

/**
 * Press the flag: the button grows into the list, the highlight glides
 * under the pointer; pick a country and the flag and code roll in the way
 * the list goes. Type a number: a tick pops once it is complete. Type
 * « + » in the number to search by code.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('+33 6 12 34 56')
    return (
      <PhoneField label="Téléphone" value={value} onValueChange={setValue} />
    )
  },
})
