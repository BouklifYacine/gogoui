import { useState } from 'react'

import preview from '#.storybook/preview'

import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'
import { Treemap } from './treemap.tsx'
import type { TreemapNode } from './treemap.tsx'

/** The year's revenue by space, then by event type; `measure` is the change from the year before, in percent. */
function revenue(year: number): TreemapNode {
  const later = year === 2026
  return {
    id: 'domaine',
    label: `Domaine, ${year}`,
    children: [
      {
        id: 'grange',
        label: 'La Grange',
        children: [
          {
            id: 'grange-mariages',
            label: 'Mariages',
            value: later ? 168000 : 142000,
            measure: 18,
          },
          {
            id: 'grange-seminaires',
            label: 'Séminaires',
            value: later ? 31000 : 27000,
            measure: 15,
          },
          {
            id: 'grange-anniversaires',
            label: 'Anniversaires',
            value: later ? 15000 : 13000,
            measure: 9,
          },
        ],
      },
      {
        id: 'orangerie',
        label: "L'Orangerie",
        children: [
          {
            id: 'orangerie-mariages',
            label: 'Mariages',
            value: later ? 54000 : 63000,
            measure: -14,
          },
          {
            id: 'orangerie-entreprise',
            label: "Soirées d'entreprise",
            value: later ? 22000 : 19000,
            measure: 16,
          },
          {
            id: 'orangerie-baptemes',
            label: 'Baptêmes',
            value: later ? 12000 : 14000,
            measure: -12,
          },
        ],
      },
      {
        id: 'voutes',
        label: 'Salle des voûtes',
        children: [
          {
            id: 'voutes-seminaires',
            label: 'Séminaires',
            value: later ? 46000 : 37000,
            measure: 24,
          },
          {
            id: 'voutes-diners',
            label: 'Dîners privés',
            value: later ? 33000 : 27000,
            measure: 22,
          },
        ],
      },
      {
        id: 'hebergement',
        label: 'Hébergement',
        children: [
          {
            id: 'hebergement-chambres',
            label: 'Chambres',
            value: later ? 41000 : 30000,
            measure: 37,
          },
          {
            id: 'hebergement-gite',
            label: 'Le Gîte',
            value: later ? 32000 : 18000,
            measure: 78,
          },
        ],
      },
      {
        id: 'jardin',
        label: "Jardin d'hiver",
        children: [
          {
            id: 'jardin-cocktails',
            label: 'Cocktails',
            value: later ? 38000 : 26000,
            measure: 46,
          },
          {
            id: 'jardin-ceremonies',
            label: 'Cérémonies laïques',
            value: later ? 20000 : 15000,
            measure: 33,
          },
        ],
      },
    ],
  }
}

const year2026 = revenue(2026)
const year2025 = revenue(2025)

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const change = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})

const meta = preview.meta({
  title: 'Charts/Treemap',
  tags: ['beta'],
  component: Treemap,
  parameters: { layout: 'padded' },
  args: {
    data: year2026,
    label: "Chiffre d'affaires 2026",
    formatValue: (value: number) => euros.format(value),
    height: 420,
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <Treemap {...args} />
    </div>
  ),
})

/**
 * The year's revenue by space, then by event type. Click a space to zoom
 * in, the breadcrumb to come back; or focus the tiles: arrows move, Enter
 * zooms, Escape comes back.
 */
export const Basic = meta.story({})

/**
 * Shaded by the change from last year: the deeper the tile, the more it
 * grew.
 */
export const ShadedByChange = meta.story({
  args: {
    measureLabel: 'Évolution',
    formatMeasure: (value: number) => change.format(value / 100),
  },
})

/**
 * Zoomed into a space from the start.
 */
export const Zoomed = meta.story({ args: { defaultFocus: 'grange' } })

/**
 * Nothing invoiced yet.
 */
export const Empty = meta.story({
  args: { data: { id: 'domaine', label: 'Domaine', children: [] } },
})

/**
 * The tiles grow in a wave from the largest the first time they are seen;
 * a zoom carries the chosen space out to fill the view, or back into its
 * place; switching year morphs every tile; the crumbs and the total swap.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [year, setYear] = useState('2026')
    return (
      <div className="grid w-full max-w-4xl gap-4">
        <ToggleGroup
          aria-label="Année"
          value={[year]}
          onValueChange={(next) => {
            if (next.length > 0) setYear(next[0] as string)
          }}
        >
          <ToggleGroupItem value="2025">2025</ToggleGroupItem>
          <ToggleGroupItem value="2026">2026</ToggleGroupItem>
        </ToggleGroup>
        <Treemap
          {...args}
          data={year === '2025' ? year2025 : year2026}
          label={`Chiffre d'affaires ${year}`}
        />
      </div>
    )
  },
})
