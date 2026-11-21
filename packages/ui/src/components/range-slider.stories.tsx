import { useState } from 'react'

import preview from '#.storybook/preview'

import { RangeSlider } from './range-slider.tsx'

const meta = preview.meta({
  title: 'Formulaires/RangeSlider',
  component: RangeSlider,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/**
 * A budget from and to; the right end means no limit. The range is kept
 * when the thumb is let go.
 */
export const Basic = meta.story({
  args: {
    label: 'Budget',
    max: 50_000,
    step: 500,
    low: 10_000,
    high: undefined,
    color: 'primary',
    format: (value: number) => euros.format(value),
    onCommit: () => {},
  },
  render: function Render(args) {
    const [range, setRange] = useState<{ min?: number; max?: number }>({
      min: args.low,
      max: args.high,
    })
    return (
      <RangeSlider
        {...args}
        low={range.min}
        high={range.max}
        onCommit={setRange}
      />
    )
  },
})
