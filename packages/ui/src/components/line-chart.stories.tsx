import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { LineChart } from './line-chart.tsx'
import type { LineChartDatum } from './line-chart.tsx'
import { RollingNumber } from './rolling-number.tsx'

const longMonth = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const shortMonth = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  timeZone: 'UTC',
})

/** Months of 2026, each with its values. */
function monthly(values: Record<string, number[]>): LineChartDatum[] {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(2026, index, 1))
    return {
      key: date.toISOString().slice(0, 7),
      label: longMonth.format(date),
      axisLabel: shortMonth.format(date),
      values: Object.fromEntries(
        Object.entries(values).map(([key, list]) => [key, list[index]!]),
      ),
    }
  })
}

const requests = monthly({
  thisYear: [18, 22, 31, 38, 46, 41, 33, 24, 29, 35, 38, 27],
  lastYear: [14, 17, 24, 30, 37, 36, 28, 19, 24, 27, 30, 22],
})
const byType = monthly({
  weddings: [
    2100, 2600, 4800, 9600, 21400, 32800, 36200, 34100, 24800, 8200, 2400, 1800,
  ],
  seminars: [
    3200, 4100, 4600, 4200, 3800, 4400, 1800, 600, 5200, 6100, 5400, 3600,
  ],
  birthdays: [
    900, 1100, 1300, 1600, 2200, 2600, 3100, 2800, 1900, 1500, 1200, 2400,
  ],
})

const meta = preview.meta({
  title: 'Charts/LineChart',
  tags: ['beta'],
  component: LineChart,
  args: {
    data: requests,
    series: [
      { key: 'thisYear', label: '2026' },
      { key: 'lastYear', label: '2025', dashed: true, area: false },
    ],
    label: 'Demandes reçues',
    unit: 'demandes',
    height: 220,
    curve: 'smooth',
    loading: false,
  },
  argTypes: {
    curve: { control: 'inline-radio', options: ['smooth', 'linear'] },
  },
  render: (args) => (
    <div className="max-w-2xl rounded-xl border border-line bg-surface p-5">
      <LineChart {...args} />
    </div>
  ),
})

/**
 * Requests per month this year against last year (dashed). Point at the
 * plot, or focus it and use the arrows; the legend hides a series.
 */
export const Basic = meta.story({})

/**
 * Revenue per month by kind of event, in euros: three series on the
 * palette, the value axis written compact.
 */
export const ByEventType = meta.story({
  args: {
    data: byType,
    series: [
      { key: 'weddings', label: 'Mariages' },
      { key: 'seminars', label: 'Séminaires' },
      { key: 'birthdays', label: 'Anniversaires' },
    ],
    label: "Chiffre d'affaires par type d'événement",
    unit: undefined,
    format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
  },
})

/**
 * Straight segments instead of curves.
 */
export const Linear = meta.story({ args: { curve: 'linear' } })

/**
 * Loading: the lines stay on screen, dimmed, while the next range comes.
 */
export const Loading = meta.story({ args: { loading: true } })

/**
 * Nothing to draw.
 */
export const Empty = meta.story({ args: { data: [] } })

/**
 * The lines draw left to right once seen; another range morphs them; a
 * hidden series flattens while the axis rescales; the crosshair and the
 * tooltip glide, and drive a rolling headline.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [half, setHalf] = useState(false)
    const [reading, setReading] = useState<number | null>(null)
    const data = half ? requests.slice(6) : requests
    const shown =
      (reading === null ? undefined : data[reading]) ?? data[data.length - 1]!
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <div className="grid gap-4 rounded-xl border border-line bg-surface p-5">
          <div>
            <p className="text-sm text-fg-muted">{shown.label}</p>
            <p className="text-3xl font-medium tabular-nums">
              <RollingNumber value={shown.values.thisYear ?? 0} /> demandes
            </p>
          </div>
          <LineChart
            {...args}
            data={data}
            onActiveChange={(index) => setReading(index)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={half ? 'outline' : 'default'}
            onClick={() => setHalf(false)}
          >
            12 mois
          </Button>
          <Button
            variant={half ? 'default' : 'outline'}
            onClick={() => setHalf(true)}
          >
            6 mois
          </Button>
        </div>
      </div>
    )
  },
})
