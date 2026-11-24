import { useState } from 'react'

import preview from '#.storybook/preview'

import { Ridgeline } from './ridgeline.tsx'
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

/** A steady pseudo-random source, so the story looks the same each time. */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/** Guests per wedding, month by month: small spring weddings, large summer ones. */
function guestsByMonth(year: number) {
  const random = seeded(year)
  const normal = () => {
    const u = Math.max(1e-9, random())
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random())
  }
  const months = [
    { id: 'avril', label: 'Avril', mean: 72, spread: 22, count: 9 },
    { id: 'mai', label: 'Mai', mean: 96, spread: 26, count: 16 },
    { id: 'juin', label: 'Juin', mean: 124, spread: 30, count: 24 },
    { id: 'juillet', label: 'Juillet', mean: 138, spread: 34, count: 27 },
    { id: 'aout', label: 'Août', mean: 132, spread: 38, count: 22 },
    { id: 'septembre', label: 'Septembre', mean: 110, spread: 28, count: 19 },
    { id: 'octobre', label: 'Octobre', mean: 78, spread: 24, count: 8 },
  ]
  const lift = year === 2026 ? 1.08 : 1
  return months.map((month) => ({
    id: month.id,
    label: month.label,
    values: Array.from({ length: month.count }, () =>
      Math.max(20, Math.round(month.mean * lift + normal() * month.spread)),
    ),
  }))
}

const season2026 = guestsByMonth(2026)
const season2025 = guestsByMonth(2025)

const meta = preview.meta({
  title: 'Graphiques/Courbes/Ridgeline',
  tags: ['beta'],
  component: Ridgeline,
  parameters: { layout: 'padded' },
  args: {
    series: season2026,
    label: 'Invités par mariage, selon le mois, 2026',
    unit: 'invités',
    tint: true,
    overlap: 2.4,
    rowHeight: 30,
  },
  render: (args) => (
    <div className="w-full max-w-3xl">
      <Ridgeline {...args} />
    </div>
  ),
})

/**
 * How many guests each wedding brings, month by month: each ridge is the
 * shape of a month, shaded by its median. Point at a ridge, or focus the
 * chart: up and down choose a month, left and right move along the
 * guests.
 */
export const Basic = meta.story({})

/**
 * One shade for every ridge, without the median scale.
 */
export const OneShade = meta.story({ args: { tint: false, color: 'chart-3' } })

/**
 * A month lifted from the start, its middle half shaded.
 */
export const Lifted = meta.story({ args: { defaultActive: 'juillet' } })

/**
 * No wedding yet.
 */
export const Empty = meta.story({ args: { series: [] } })

/**
 * The ridges rise in a wave from the top row the first time they are
 * seen; switching year morphs them and slides the axis; a ridge lifts
 * over its neighbours and the tooltip glides.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [year, setYear] = useState('2026')
    return (
      <div className="grid w-full max-w-3xl gap-4">
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
        <Ridgeline
          {...args}
          series={year === '2025' ? season2025 : season2026}
          label={`Invités par mariage, selon le mois, ${year}`}
        />
      </div>
    )
  },
})
