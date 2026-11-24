import { useState } from 'react'

import preview from '#.storybook/preview'

import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'
import { WaffleChart } from './waffle-chart.tsx'

const saturdays2026 = [
  { key: 'mariage', label: 'Mariages', value: 31 },
  { key: 'option', label: 'Options posées', value: 6 },
  { key: 'prive', label: 'Fêtes privées', value: 5 },
  { key: 'seminaire', label: 'Séminaires', value: 3 },
  { key: 'libre', label: 'Libres', value: 7 },
]

const saturdays2025 = [
  { key: 'mariage', label: 'Mariages', value: 24 },
  { key: 'option', label: 'Options posées', value: 2 },
  { key: 'prive', label: 'Fêtes privées', value: 8 },
  { key: 'seminaire', label: 'Séminaires', value: 4 },
  { key: 'libre', label: 'Libres', value: 14 },
]

const meta = preview.meta({
  title: 'Graphiques/Barres/WaffleChart',
  tags: ['beta'],
  component: WaffleChart,
  parameters: { layout: 'padded' },
  args: {
    data: saturdays2026,
    label: 'Samedis de la saison 2026',
    unit: 'samedis',
    rows: 10,
    columns: 10,
    legend: true,
    decimals: 0,
  },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <WaffleChart {...args} />
    </div>
  ),
})

/**
 * The 52 Saturdays of the season by what fills them: one cell per
 * percent. Point at a cell, or focus the grid and use the arrows.
 */
export const Basic = meta.story({})

/**
 * Pinned from the legend: the other categories step back until the
 * button is pressed again.
 */
export const Pinned = meta.story({ args: { defaultActiveKey: 'libre' } })

/**
 * Without its legend, when the card already names the parts; a 5 × 20
 * grid makes a band.
 */
export const Band = meta.story({
  args: { legend: false, rows: 5, columns: 20 },
})

/**
 * Nothing to count yet.
 */
export const Empty = meta.story({ args: { data: [] } })

/**
 * The cells fill in a wave from the bottom-left corner; switching season
 * moves cells from one category to another (each dips in flight) and the
 * shares count to their new value.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [season, setSeason] = useState('2026')
    return (
      <div className="grid w-full max-w-2xl gap-4">
        <ToggleGroup
          aria-label="Saison"
          value={[season]}
          onValueChange={(next) => {
            if (next.length > 0) setSeason(next[0] as string)
          }}
        >
          <ToggleGroupItem value="2025">2025</ToggleGroupItem>
          <ToggleGroupItem value="2026">2026</ToggleGroupItem>
        </ToggleGroup>
        <WaffleChart
          {...args}
          label={`Samedis de la saison ${season}`}
          data={season === '2025' ? saturdays2025 : saturdays2026}
        />
      </div>
    )
  },
})
