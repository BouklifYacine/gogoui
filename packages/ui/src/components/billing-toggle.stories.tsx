import { useState } from 'react'

import preview from '#.storybook/preview'

import { BillingPrice } from './billing-price.tsx'
import { BillingToggle, BillingToggleItem } from './billing-toggle.tsx'

const meta = preview.meta({
  title: 'Blocs marketing/BillingToggle',
  tags: ['beta'],
  component: BillingToggle,
  args: {
    value: 'monthly',
    onValueChange: () => {},
    size: 'default',
    color: 'success',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    color: {
      control: 'select',
      options: ['neutral', 'primary', 'info', 'success', 'warning', 'danger'],
    },
  },
})

/**
 * Mensuel / Annuel, with the saving badge on the yearly period.
 */
export const Basic = meta.story({
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <BillingToggle {...args} value={value} onValueChange={setValue}>
        <BillingToggleItem value="monthly">Mensuel</BillingToggleItem>
        <BillingToggleItem value="yearly" badge="−20 %">
          Annuel
        </BillingToggleItem>
      </BillingToggle>
    )
  },
})

/**
 * Without items: Mensuel and Annuel in the provider's language.
 */
export const DefaultPeriods = meta.story({
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <BillingToggle {...args} value={value} onValueChange={setValue} />
  },
})

/**
 * The three sizes.
 */
export const Sizes = meta.story({
  render: function Render() {
    const [value, setValue] = useState('yearly')
    return (
      <div className="flex flex-col items-start gap-4">
        {(['sm', 'default', 'lg'] as const).map((size) => (
          <BillingToggle
            key={size}
            size={size}
            value={value}
            onValueChange={setValue}
          >
            <BillingToggleItem value="monthly">Mensuel</BillingToggleItem>
            <BillingToggleItem value="yearly" badge="−20 %">
              Annuel
            </BillingToggleItem>
          </BillingToggle>
        ))}
      </div>
    )
  },
})

/**
 * Switch the period: the thumb glides, the badge tints and rewrites itself
 * in place (« −20 % » → « 2 mois offerts »), the price rolls to its new
 * amount and the former price opens in width; a pressed period sinks.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('monthly')
    const yearly = value === 'yearly'
    return (
      <div className="flex flex-col items-start gap-6">
        <BillingToggle value={value} onValueChange={setValue}>
          <BillingToggleItem value="monthly">Mensuel</BillingToggleItem>
          <BillingToggleItem
            value="yearly"
            badge="−20 %"
            activeBadge="2 mois offerts"
          >
            Annuel
          </BillingToggleItem>
        </BillingToggle>
        <BillingPrice
          amount={yearly ? 47 : 59}
          was={yearly ? 59 : undefined}
          period={yearly ? '/ mois, facturé à l’année' : '/ mois'}
        />
      </div>
    )
  },
})
