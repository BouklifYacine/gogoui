import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { DonutChart } from './donut-chart.tsx'

const events2026 = [
  { key: 'wedding', label: 'Mariages', value: 46 },
  { key: 'seminar', label: 'Séminaires', value: 18 },
  { key: 'birthday', label: 'Anniversaires', value: 12 },
  { key: 'christening', label: 'Baptêmes', value: 6 },
  { key: 'cocktail', label: "Cocktails d'entreprise", value: 4 },
  { key: 'family', label: 'Repas de famille', value: 2 },
  { key: 'shooting', label: 'Shootings photo', value: 1 },
]
const events2025 = [
  { key: 'wedding', label: 'Mariages', value: 39 },
  { key: 'seminar', label: 'Séminaires', value: 22 },
  { key: 'birthday', label: 'Anniversaires', value: 9 },
  { key: 'christening', label: 'Baptêmes', value: 8 },
  { key: 'cocktail', label: "Cocktails d'entreprise", value: 7 },
  { key: 'family', label: 'Repas de famille', value: 1 },
]
const spaces = [
  { key: 'barn', label: 'La Grange', value: 186400 },
  { key: 'orangery', label: "L'Orangerie", value: 94200 },
  { key: 'park', label: 'Le Parc', value: 61800 },
  { key: 'lodging', label: 'Les Gîtes', value: 38600 },
]

const meta = preview.meta({
  title: 'Graphiques/Proportions/DonutChart',
  tags: ['beta'],
  component: DonutChart,
  args: {
    data: events2026,
    label: 'Événements par type en 2026',
    unit: 'événements',
    size: 208,
    thickness: 24,
    groupBelow: 0.04,
    maxSegments: 6,
    legendAction: 'toggle',
    legend: true,
  },
  argTypes: {
    legendAction: { control: 'inline-radio', options: ['toggle', 'select'] },
  },
  render: (args) => (
    <div className="max-w-2xl rounded-xl border border-line bg-surface p-5">
      <DonutChart {...args} />
    </div>
  ),
})

/**
 * Events by type: the small kinds join « Autres ». Point at a segment or
 * a row; press a row to hide its segment.
 */
export const Basic = meta.story({})

/**
 * Revenue by space, in euros; pressing a row selects its segment.
 */
export const RevenueBySpace = meta.story({
  args: {
    data: spaces,
    label: "Chiffre d'affaires par espace",
    unit: undefined,
    format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
    totalLabel: 'Total 2026',
    legendAction: 'select',
  },
})

/**
 * Without legend: the ring itself takes the focus and is read with the
 * arrows; Enter selects.
 */
export const WithoutLegend = meta.story({ args: { legend: false } })

/**
 * Nothing to share out.
 */
export const Empty = meta.story({ args: { data: [] } })

/**
 * The ring sweeps in once seen, each edge a beat after the one before;
 * another year moves every arc from where it is; the active segment
 * slides out and the centre rolls like a drum while its figures count.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [year, setYear] = useState<2025 | 2026>(2026)
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <div className="rounded-xl border border-line bg-surface p-5">
          <DonutChart
            {...args}
            data={year === 2026 ? events2026 : events2025}
            label={`Événements par type en ${year}`}
          />
        </div>
        <div className="flex gap-2">
          {([2025, 2026] as const).map((each) => (
            <Button
              key={each}
              variant={each === year ? 'default' : 'outline'}
              onClick={() => setYear(each)}
            >
              {each}
            </Button>
          ))}
        </div>
      </div>
    )
  },
})
