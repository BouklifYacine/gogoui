import { useState } from 'react'

import preview from '#.storybook/preview'

import { SlopeChart } from './slope-chart.tsx'
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

const revenueBySpace = [
  { key: 'grange', label: 'La Grange', start: 182000, end: 214000 },
  { key: 'orangerie', label: "L'Orangerie", start: 96000, end: 88000 },
  { key: 'voutes', label: 'Salle des voûtes', start: 64000, end: 79000 },
  { key: 'jardin', label: "Jardin d'hiver", start: 41000, end: 58000 },
  { key: 'gite', label: 'Le Gîte', start: 18000, end: 32000 },
  { key: 'chapelle', label: 'La Chapelle', start: 23000, end: 21000 },
]

const guestsByType = [
  { key: 'mariage', label: 'Mariage', start: 118, end: 126 },
  { key: 'seminaire', label: 'Séminaire', start: 42, end: 55 },
  { key: 'anniversaire', label: 'Anniversaire', start: 64, end: 58 },
  { key: 'bapteme', label: 'Baptême', start: 51, end: 47 },
  { key: 'entreprise', label: "Soirée d'entreprise", start: 88, end: 97 },
]

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 0,
})

const meta = preview.meta({
  title: 'Graphiques/Courbes/SlopeChart',
  tags: ['beta'],
  component: SlopeChart,
  parameters: { layout: 'padded' },
  args: {
    data: revenueBySpace,
    label: "Chiffre d'affaires par espace",
    startLabel: '2025',
    endLabel: '2026',
    formatValue: (value: number) => euros.format(value),
    ranks: true,
  },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <SlopeChart {...args} />
    </div>
  ),
})

/**
 * Each space's revenue, 2025 against 2026: the change and the new order
 * at a glance. Point at a line, or focus the chart and use the arrows.
 */
export const Basic = meta.story({})

/**
 * The space the story is about, drawn in colour while the others stay
 * neutral.
 */
export const Highlighted = meta.story({
  args: { highlightKey: 'gite', color: 'success' },
})

/**
 * Without the rank changes, for a narrow card.
 */
export const WithoutRanks = meta.story({ args: { ranks: false } })

/**
 * No space has a revenue yet.
 */
export const Empty = meta.story({ args: { data: [] } })

/**
 * The lines draw from left to right, their dots landing as each line
 * ends; switching the measure moves lines, dots and labels and rolls the
 * rank changes.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [measure, setMeasure] = useState('revenue')
    const revenue = measure === 'revenue'
    return (
      <div className="grid w-full max-w-2xl gap-4">
        <ToggleGroup
          aria-label="Mesure"
          value={[measure]}
          onValueChange={(next) => {
            if (next.length > 0) setMeasure(next[0] as string)
          }}
        >
          <ToggleGroupItem value="revenue">Chiffre d'affaires</ToggleGroupItem>
          <ToggleGroupItem value="guests">Invités moyens</ToggleGroupItem>
        </ToggleGroup>
        <SlopeChart
          {...args}
          data={revenue ? revenueBySpace : guestsByType}
          label={
            revenue
              ? "Chiffre d'affaires par espace"
              : "Invités moyens par type d'événement"
          }
          formatValue={
            revenue ? (value: number) => euros.format(value) : undefined
          }
        />
      </div>
    )
  },
})
