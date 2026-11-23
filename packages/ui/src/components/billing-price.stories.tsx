import { useState } from 'react'

import preview from '#.storybook/preview'

import { BillingPrice } from './billing-price.tsx'
import { Button } from './button.tsx'

const meta = preview.meta({
  title: 'Composants/BillingPrice',
  tags: ['beta'],
  component: BillingPrice,
  args: { amount: 59, period: '/ mois' },
})

/**
 * A plan's price and its period.
 */
export const Basic = meta.story({})

/**
 * Cheaper than before: the former price, struck out, beside it.
 */
export const WithFormerPrice = meta.story({
  args: { amount: 47, was: 59, period: '/ mois, facturé à l’année' },
})

/**
 * The amount rolls digit by digit, the former price opens in width and
 * the period changes width without a jump.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [yearly, setYearly] = useState(false)
    return (
      <div className="flex flex-col items-start gap-4">
        <BillingPrice
          amount={yearly ? 47 : 59}
          was={yearly ? 59 : undefined}
          period={yearly ? '/ mois, facturé à l’année' : '/ mois'}
        />
        <Button variant="outline" onClick={() => setYearly((now) => !now)}>
          {yearly ? 'Voir le mensuel' : 'Voir l’annuel'}
        </Button>
      </div>
    )
  },
})
