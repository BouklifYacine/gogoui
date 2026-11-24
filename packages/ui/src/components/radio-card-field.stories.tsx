import { useState } from 'react'
import { BuildingsIcon, HouseLineIcon, TreeIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { RadioCardField } from './radio-card-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/RadioCardField',
  component: RadioCardField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

const kinds = [
  { value: 'castle', label: 'Château', icon: BuildingsIcon },
  { value: 'farm', label: 'Ferme', icon: HouseLineIcon },
  { value: 'garden', label: 'Jardin', icon: TreeIcon },
] as const

/**
 * A few choices seen at once, each a card with its icon.
 */
export const Cards = meta.story({
  args: {
    name: 'kind',
    legend: 'Type de lieu',
    error: '',
    hideLegend: false,
    inline: false,
    list: false,
    options: kinds,
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <RadioCardField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Two or three one-word choices on one line.
 */
export const Inline = meta.story({
  render: function Render() {
    const [value, setValue] = useState<'day' | 'evening' | ''>('day')
    return (
      <RadioCardField
        name="moment"
        legend="Moment"
        inline
        options={[
          { value: 'day', label: 'Journée' },
          { value: 'evening', label: 'Soirée' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Many one-line choices in one framed list.
 */
export const List = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <RadioCardField
        name="guests"
        legend="Nombre d'invités"
        list
        options={[
          { value: '50', label: 'Moins de 50' },
          { value: '100', label: '50 à 100' },
          { value: '150', label: '100 à 150' },
          { value: '200', label: 'Plus de 150' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

const plans = [
  {
    value: 'essential',
    label: 'Essentiel',
    description: 'Un lieu, les demandes et le calendrier.',
    meta: '29 € / mois',
  },
  {
    value: 'pro',
    label: 'Pro',
    description: 'Plusieurs espaces, les devis, les factures et les acomptes.',
    meta: '59 € / mois',
  },
  {
    value: 'group',
    label: 'Groupe',
    description: 'Plusieurs domaines sous un même compte.',
    meta: 'Sur devis',
    disabled: true,
    disabledReason: 'Disponible au printemps.',
  },
]

/**
 * Cards side by side with a sentence and a price: the prices share one
 * line, and an option that cannot be chosen says why.
 */
export const WithPrices = meta.story({
  decorators: [(Story) => <div className="w-[40rem]">{Story()}</div>],
  render: function Render() {
    const [value, setValue] = useState('pro')
    return (
      <RadioCardField
        name="plan"
        legend="Formule"
        minColumnWidth={180}
        options={plans}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Choose another card: one ring glides from the old card to the new one,
 * over its edge, and the dot springs in. The first choice fades the ring
 * in; the list glides the same way.
 */
export const Animations = meta.story({
  tags: ['animated'],
  decorators: [(Story) => <div className="w-[40rem]">{Story()}</div>],
  render: function Render() {
    const [plan, setPlan] = useState('')
    const [guests, setGuests] = useState('100')
    return (
      <div className="grid gap-6">
        <RadioCardField
          name="plan-motion"
          legend="Formule"
          minColumnWidth={180}
          options={plans}
          value={plan}
          onValueChange={setPlan}
        />
        <RadioCardField
          name="guests-motion"
          legend="Nombre d'invités"
          list
          options={[
            { value: '50', label: 'Moins de 50', meta: '1 200 €' },
            { value: '100', label: '50 à 100', meta: '2 400 €' },
            { value: '150', label: 'Plus de 100', meta: '3 600 €' },
          ]}
          value={guests}
          onValueChange={setGuests}
        />
      </div>
    )
  },
})
