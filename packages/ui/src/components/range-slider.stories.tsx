import { useState } from 'react'

import preview from '#.storybook/preview'

import { RangeSlider } from './range-slider.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/RangeSlider',
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

// Two hundred budgets, most between 8 000 and 20 000 €, a few higher.
const budgets = Array.from({ length: 200 }, (_, index) => {
  const wave = Math.sin(index * 12.9898) * 43_758.5453
  const random = wave - Math.floor(wave)
  return index % 9 === 0
    ? 25_000 + random * 25_000
    : 8_000 + random * random * 14_000
})

const histogramArgs = {
  label: 'Budget',
  max: 50_000,
  step: 500,
  low: 10_000,
  high: 30_000,
  color: 'primary' as const,
  format: (value: number) => euros.format(value),
  histogram: { data: budgets, bins: 32 },
  onCommit: () => {},
}

/**
 * The budgets the filter applies to, as bars over the track: the bars
 * inside the range light up.
 */
export const Histogram = meta.story({
  args: histogramArgs,
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

/**
 * Drag a thumb: the lit bars are cut exactly at it, a hairline rises from
 * it through the bars, it gives a few pixels past an end. Let go fast: it
 * travels one bar more and settles on a bar's edge. Shift+arrows go bar
 * by bar.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: histogramArgs,
  render: function Render(args) {
    const [range, setRange] = useState<{ min?: number; max?: number }>({
      min: 12_000,
      max: 22_000,
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
