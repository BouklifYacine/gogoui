import { useState } from 'react'

import preview from '#.storybook/preview'

import { BarChart } from './bar-chart.tsx'
import type { BarChartDatum } from './bar-chart.tsx'
import { Button } from './button.tsx'

const longMonth = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const shortMonth = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  timeZone: 'UTC',
})

// A wedding venue's revenue per month, January 2025 to December 2026:
// high season from May to September.
const revenueValues = [
  4200, 5100, 7800, 12400, 26800, 38400, 41200, 39800, 31600, 14200, 6400, 9800,
  5600, 6200, 9400, 15800, 29600, 42800, 46400, 44100, 35200, 16900, 7800,
  11200,
]
const revenue: BarChartDatum[] = revenueValues.map((value, index) => {
  const date = new Date(Date.UTC(2025, index, 1))
  return {
    key: date.toISOString().slice(0, 7),
    label: longMonth.format(date),
    axisLabel: shortMonth.format(date),
    value,
  }
})

const weeks: BarChartDatum[] = [
  ['2026-10-05', '5 oct.', 6],
  ['2026-10-12', '12 oct.', 9],
  ['2026-10-19', '19 oct.', 4],
  ['2026-10-26', '26 oct.', 7],
  ['2026-11-02', '2 nov.', 11],
  ['2026-11-09', '9 nov.', 8],
  ['2026-11-16', '16 nov.', 13],
  ['2026-11-23', '23 nov.', 10],
].map(([key, short, value]) => ({
  key: key as string,
  label: `Semaine du ${short as string}`,
  axisLabel: short as string,
  value: value as number,
}))

const euros = {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
} as const

const meta = preview.meta({
  title: 'Charts/BarChart',
  tags: ['beta'],
  component: BarChart,
  args: {
    data: revenue.slice(12),
    label: "Chiffre d'affaires",
    period: '2026',
    format: euros,
    showAverage: true,
    height: 176,
    color: 'chart-1',
  },
  render: (args) => (
    <div className="max-w-2xl rounded-xl border border-line bg-surface p-5">
      <BarChart {...args} />
    </div>
  ),
})

/**
 * Revenue per month in 2026, with the monthly average as headline and
 * dashed line. Point at a bar, or focus the chart and use the arrows.
 */
export const Basic = meta.story({})

/**
 * Requests per week, a word after each value.
 */
export const Requests = meta.story({
  args: {
    data: weeks,
    label: 'Demandes reçues',
    period: 'Huit dernières semaines',
    unit: 'demandes',
    format: undefined,
    averageLabel: 'Moyenne par semaine',
    color: 'chart-2',
  },
})

/**
 * Without the average line.
 */
export const WithoutAverage = meta.story({ args: { showAverage: false } })

/**
 * The bars grow one after another once seen; a new range zooms around
 * the latest month (bars that stay slide, new ones grow, old ones sink)
 * and the gridlines and average follow; the headline's digits roll.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [months, setMonths] = useState(12)
    const periods: Record<number, string> = {
      6: 'Six derniers mois',
      12: '2026',
      24: '2025 et 2026',
    }
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <div className="rounded-xl border border-line bg-surface p-5">
          <BarChart
            {...args}
            data={revenue.slice(24 - months)}
            period={periods[months]!}
          />
        </div>
        <div className="flex gap-2">
          {[6, 12, 24].map((count) => (
            <Button
              key={count}
              variant={count === months ? 'default' : 'outline'}
              onClick={() => setMonths(count)}
            >
              {count} mois
            </Button>
          ))}
        </div>
      </div>
    )
  },
})
