import { useState } from 'react'

import preview from '#.storybook/preview'

import { BrushChart } from './brush-chart.tsx'
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

const DAY = 86_400_000

/** A steady pseudo-random series, so the story looks the same each time. */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/** The requests received each day for two years: a peak after the wedding fairs, quiet summers, fewer on Sundays. */
function requests() {
  const random = seeded(7)
  const start = new Date(2025, 0, 1)
  return Array.from({ length: 730 }, (_, index) => {
    const date = new Date(start.getFullYear(), 0, 1 + index)
    const yearDay = (index % 365) / 365
    const season =
      1 +
      0.9 * Math.exp(-(((yearDay - 0.08) / 0.07) ** 2)) +
      0.4 * Math.exp(-(((yearDay - 0.75) / 0.06) ** 2)) -
      0.35 * Math.exp(-(((yearDay - 0.58) / 0.05) ** 2))
    const growth = 1 + index / 1400
    const sunday = date.getDay() === 0 ? 0.45 : 1
    return {
      date,
      value: Math.max(
        0,
        Math.round(9 * season * growth * sunday + (random() - 0.5) * 7),
      ),
    }
  })
}

const data = requests()
const last = (data[data.length - 1].date as Date).getTime()

const annotations = [
  {
    date: new Date(2025, 0, 18),
    label: 'Salon du mariage',
    description: 'Stand partagé avec le traiteur, 140 contacts.',
  },
  {
    date: new Date(2025, 8, 20),
    label: 'Portes ouvertes',
  },
  {
    date: new Date(2026, 0, 17),
    label: 'Salon du mariage',
    description: 'Premier salon avec le formulaire de demande en ligne.',
  },
  {
    date: new Date(2026, 4, 4),
    label: 'Nouveau site',
    description: 'Les photos des espaces et le formulaire sur chaque page.',
  },
]

const meta = preview.meta({
  title: 'Graphiques/Courbes/BrushChart',
  tags: ['beta'],
  component: BrushChart,
  parameters: { layout: 'padded' },
  args: {
    data,
    annotations,
    label: 'Demandes reçues par jour',
    unit: 'demandes',
    height: 240,
    overviewHeight: 52,
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <BrushChart {...args} />
    </div>
  ),
})

/**
 * Two years of requests, day by day. Drag the window in the strip below,
 * pull its edges, or draw a new one; a double click shows everything.
 */
export const Basic = meta.story({
  // Out of the automatic run: in the test runner (Vite dev mode) it takes
  // over a minute, against under a second in a browser, where it passes
  // axe. To investigate; the other stories of this component are tested.
  tags: ['!test'],
})

/**
 * The last three months, chosen from the start.
 */
export const LastQuarter = meta.story({
  args: { defaultRange: [last - 91 * DAY, last] },
})

/**
 * The window driven from outside: each preset glides it there.
 */
export const Presets = meta.story({
  render: function Render(args) {
    const [preset, setPreset] = useState('all')
    const spans: Record<string, number> = { month: 30, half: 182 }
    const range: [number, number] =
      preset === 'all'
        ? [(data[0].date as Date).getTime(), last]
        : [last - spans[preset] * DAY, last]
    return (
      <div className="grid w-full max-w-4xl gap-4">
        <ToggleGroup
          aria-label="Période"
          value={[preset]}
          onValueChange={(next) => {
            if (next.length > 0) setPreset(next[0] as string)
          }}
        >
          <ToggleGroupItem value="month">30 jours</ToggleGroupItem>
          <ToggleGroupItem value="half">6 mois</ToggleGroupItem>
          <ToggleGroupItem value="all">Tout</ToggleGroupItem>
        </ToggleGroup>
        <BrushChart {...args} range={range} />
      </div>
    )
  },
})

/**
 * No request yet.
 */
export const Empty = meta.story({ args: { data: [], annotations: [] } })

/**
 * The line draws in from the left the first time it is seen; a preset
 * glides the window and the value axis springs to the tallest day in
 * view; zoomed out, the seven-day average and its band fade in.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [preset, setPreset] = useState('all')
    const range: [number, number] =
      preset === 'all'
        ? [(data[0].date as Date).getTime(), last]
        : [last - 45 * DAY, last]
    return (
      <div className="grid w-full max-w-4xl gap-4">
        <ToggleGroup
          aria-label="Période"
          value={[preset]}
          onValueChange={(next) => {
            if (next.length > 0) setPreset(next[0] as string)
          }}
        >
          <ToggleGroupItem value="recent">45 jours</ToggleGroupItem>
          <ToggleGroupItem value="all">Tout</ToggleGroupItem>
        </ToggleGroup>
        <BrushChart {...args} range={range} />
      </div>
    )
  },
})
