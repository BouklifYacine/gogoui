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
 *
 * @summary A range on a track.
 */
export const Basic = meta.story({
  render: function Render() {
    const [range, setRange] = useState<{ min?: number; max?: number }>({
      min: 10_000,
    })
    return (
      <RangeSlider
        label="Budget"
        max={50_000}
        step={500}
        low={range.min}
        high={range.max}
        format={(value) => euros.format(value)}
        onCommit={setRange}
      />
    )
  },
})
