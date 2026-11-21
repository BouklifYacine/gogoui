import preview from '#.storybook/preview'

import { FunnelChart } from './funnel-chart.tsx'

const steps = [
  { label: 'Demandes', value: 120, color: 'var(--chart-1)' },
  { label: 'Visites', value: 54, color: 'var(--chart-2)' },
  { label: 'Options', value: 23, color: 'var(--chart-3)' },
  { label: 'Signés', value: 14, color: 'var(--chart-4)' },
]

const meta = preview.meta({
  title: 'Composants/FunnelChart',
  component: FunnelChart,
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <FunnelChart {...args} />
    </div>
  ),
})

/**
 * From the requests received to the contracts signed: where people drop
 * off between two steps. The chart takes the width of its parent.
 */
export const Basic = meta.story({
  args: { data: steps, orientation: 'horizontal' },
})
