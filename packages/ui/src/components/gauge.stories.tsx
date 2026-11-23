import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { Gauge } from './gauge.tsx'

const filling = [
  { from: 0, color: 'warning', label: 'Calme' },
  { from: 50, color: 'primary', label: 'Correct' },
  { from: 80, color: 'success', label: 'Presque complet' },
] as const

const meta = preview.meta({
  title: 'Charts/Gauge',
  tags: ['beta'],
  component: Gauge,
  args: {
    value: 214,
    min: 0,
    max: 300,
    label: 'Jours réservés en 2026',
    detail: '214 jours sur 300 ouvrables',
    color: 'primary',
    size: 'default',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
  },
})

/**
 * A year's booked days against the days the venue opens.
 */
export const Basic = meta.story({})

/**
 * Bands name the state and give the ring its colour: under 50 % calm,
 * then correct, then nearly full.
 */
export const Thresholds = meta.story({
  args: {
    value: 84,
    max: 100,
    label: 'Taux de remplissage',
    detail: 'Juin 2026',
    thresholds: filling,
  },
})

/**
 * A deposit collected, in the success colour.
 */
export const Deposit = meta.story({
  args: {
    value: 8400,
    max: 12000,
    label: 'Acomptes encaissés',
    detail: '8 400 € sur 12 000 €',
    color: 'success',
  },
})

/**
 * The three sizes.
 */
export const Sizes = meta.story({
  render: () => (
    <div className="flex items-end gap-6">
      <Gauge value={62} label="Petit" size="sm" />
      <Gauge value={62} label="Par défaut" />
      <Gauge value={62} label="Grand" size="lg" />
    </div>
  ),
})

/**
 * The ring fills once seen and the percentage counts with it; a new value
 * springs the ring, and the band's word swaps as the count crosses it.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState(42)
    return (
      <div className="flex flex-col items-center gap-4">
        <Gauge
          value={value}
          label="Taux de remplissage"
          detail={`${value} jours réservés sur 100`}
          thresholds={filling}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setValue((v) => Math.max(0, v - 15))}
          >
            −15
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue((v) => Math.min(100, v + 15))}
          >
            +15
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue(Math.round(Math.random() * 100))}
          >
            Au hasard
          </Button>
        </div>
      </div>
    )
  },
})
