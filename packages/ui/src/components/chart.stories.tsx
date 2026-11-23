import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import preview from '#.storybook/preview'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from './chart.tsx'
import type { ChartConfig } from './chart.tsx'

const data = [
  { month: 'Jan', requests: 12 },
  { month: 'Fév', requests: 18 },
  { month: 'Mar', requests: 25 },
  { month: 'Avr', requests: 31 },
  { month: 'Mai', requests: 22 },
  { month: 'Juin', requests: 14 },
]

const config = {
  requests: { label: 'Demandes', color: 'var(--chart-1)' },
} satisfies ChartConfig

const meta = preview.meta({
  title: 'Charts/Chart',
  component: ChartContainer,
})

/**
 * Requests per month in bars, the colour from the theme, a tooltip on
 * hover.
 */
export const Basic = meta.story({
  render: () => (
    <ChartContainer config={config} className="h-56 w-96">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="requests" fill="var(--color-requests)" radius={6} />
      </BarChart>
    </ChartContainer>
  ),
})
