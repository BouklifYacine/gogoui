import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { Sparkline } from './sparkline.tsx'

const months = [
  'décembre 2025',
  'janvier 2026',
  'février 2026',
  'mars 2026',
  'avril 2026',
  'mai 2026',
  'juin 2026',
  'juillet 2026',
  'août 2026',
  'septembre 2026',
  'octobre 2026',
  'novembre 2026',
]
const requests = [14, 19, 22, 31, 36, 42, 38, 27, 21, 29, 34, 38]
const revenue = [
  8400, 11200, 9800, 15600, 21400, 32800, 41200, 38600, 29400, 24800, 17600,
  12900,
]

const meta = preview.meta({
  title: 'Graphiques/Courbes/Sparkline',
  tags: ['beta'],
  component: Sparkline,
  args: {
    data: requests,
    label: 'Demandes reçues',
    value: 38,
    change: '+12 % vs octobre',
    labels: months,
    color: 'chart-1',
    height: 52,
    area: true,
    interactive: true,
  },
  render: (args) => (
    <div className="w-72 rounded-xl border border-line bg-surface p-4">
      <Sparkline {...args} />
    </div>
  ),
})

/**
 * Requests per month: the latest figure and its change at rest; point at
 * the line (or focus it and use the arrows) to read each month.
 */
export const Basic = meta.story({})

/**
 * Revenue in euros, written by Intl, in the success colour.
 */
export const Revenue = meta.story({
  args: {
    data: revenue,
    label: "Chiffre d'affaires",
    value: 12900,
    change: '−27 % vs octobre',
    format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
    color: 'success',
  },
})

/**
 * Without headline: the explored point's value and month take the
 * change's place.
 */
export const WithoutHeadline = meta.story({
  args: { value: undefined, change: 'sur 12 mois' },
})

/**
 * Still and without wash: a plain line in a table row.
 */
export const Still = meta.story({
  args: { interactive: false, area: false, value: undefined, change: '' },
})

/**
 * The line draws itself, the wash follows the pen and the end dot lands;
 * new data morphs the line and the headline's digits roll.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [shown, setShown] = useState<'requests' | 'quiet'>('requests')
    const [round, setRound] = useState(0)
    const data =
      shown === 'requests'
        ? requests
        : [9, 11, 10, 14, 12, 18, 15, 13, 12, 16, 17, 19]
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="w-72 rounded-xl border border-line bg-surface p-4">
          <Sparkline
            key={round}
            {...args}
            data={data}
            value={data[data.length - 1]}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setShown((now) => (now === 'requests' ? 'quiet' : 'requests'))
            }
          >
            Autres données
          </Button>
          <Button variant="outline" onClick={() => setRound((n) => n + 1)}>
            Redessiner
          </Button>
        </div>
      </div>
    )
  },
})
