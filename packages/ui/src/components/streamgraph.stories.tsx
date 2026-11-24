import { useState } from 'react'

import preview from '#.storybook/preview'

import { Streamgraph } from './streamgraph.tsx'
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

const series = [
  { key: 'mariage', label: 'Mariages' },
  { key: 'seminaire', label: 'Séminaires' },
  { key: 'anniversaire', label: 'Anniversaires' },
  { key: 'bapteme', label: 'Baptêmes' },
  { key: 'entreprise', label: "Soirées d'entreprise" },
]

const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const month = new Intl.DateTimeFormat('fr-FR', { month: 'short' })

/** The requests received each week of a year, by event type: weddings peak in winter (the fairs), seminars in autumn. */
function season(year: number, lift: number) {
  return Array.from({ length: 52 }, (_, week) => {
    const monday = new Date(year, 0, 5 + week * 7)
    const wave = (center: number, width: number) =>
      Math.exp(-(((week - center) / width) ** 2))
    const firstOfMonth = monday.getDate() <= 7
    return {
      key: `${year}-${week}`,
      label: `Semaine du ${day.format(monday)}`,
      axisLabel: firstOfMonth ? month.format(monday) : undefined,
      values: {
        mariage: Math.round(6 + 22 * lift * wave(4, 7) + 9 * wave(38, 8)),
        seminaire: Math.round(2 + 12 * wave(36, 6) + 5 * lift * wave(10, 5)),
        anniversaire: Math.round(3 + 4 * wave(20, 10) + 3 * wave(46, 4)),
        bapteme: Math.round(1 + 5 * wave(16, 6)),
        entreprise: Math.round(1 + 9 * wave(46, 3) + 3 * lift * wave(24, 4)),
      },
    }
  })
}

const year2026 = season(2026, 1)
const year2025 = season(2025, 0.7)

const meta = preview.meta({
  title: 'Graphiques/Courbes/Streamgraph',
  tags: ['beta'],
  component: Streamgraph,
  parameters: { layout: 'padded' },
  args: {
    data: year2026,
    series,
    label: "Demandes reçues par type d'événement, 2026",
    unit: 'demandes',
    offset: 'wiggle',
    height: 260,
    legend: true,
    directLabels: true,
  },
  argTypes: {
    offset: {
      control: 'inline-radio',
      options: ['wiggle', 'silhouette', 'zero'],
    },
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <Streamgraph {...args} />
    </div>
  ),
})

/**
 * The requests of the year, week by week, by event type. Point at the
 * stream, or focus it: left and right move through the weeks, up and
 * down change the layer.
 */
export const Basic = meta.story({})

/**
 * Stacked from a flat baseline, when the total matters as much as the
 * mix.
 */
export const FlatBaseline = meta.story({ args: { offset: 'zero' } })

/**
 * Two layers hidden from the start; the legend shows them again.
 */
export const HiddenLayers = meta.story({
  args: { defaultHiddenSeries: ['bapteme', 'entreprise'] },
})

/**
 * No request in the period.
 */
export const Empty = meta.story({ args: { data: [] } })

/**
 * The stream swells out of a hairline the first time it is seen;
 * switching year morphs the layers; hiding a layer thins it to nothing
 * while the others close over it; the crosshair and the tooltip glide.
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
        <Streamgraph
          {...args}
          data={year === '2025' ? year2025 : year2026}
          label={`Demandes reçues par type d'événement, ${year}`}
        />
      </div>
    )
  },
})
