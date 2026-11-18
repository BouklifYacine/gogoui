import preview from '#.storybook/preview'

import { Slider } from './slider.tsx'

const meta = preview.meta({
  title: 'Composants/Slider',
  component: Slider,
  args: { color: 'primary' },
})

/**
 * A number of guests by dragging, the value written next to it.
 *
 * @summary Drag to pick a value.
 */
export const Basic = meta.story({
  render: (args) => (
    <div className="grid w-72 gap-3">
      <span id="guests-label" className="text-sm font-medium">
        Invités : jusqu'à 150
      </span>
      <Slider
        {...args}
        defaultValue={150}
        min={20}
        max={300}
        step={10}
        aria-labelledby="guests-label"
      />
    </div>
  ),
})

/**
 * A budget between two amounts: two thumbs.
 *
 * @summary Drag two thumbs to pick a range.
 */
export const Range = meta.story({
  render: (args) => (
    <div className="grid w-72 gap-3">
      <span id="budget-label" className="text-sm font-medium">
        Budget : 8 000 à 15 000 €
      </span>
      <Slider
        {...args}
        defaultValue={[8000, 15000]}
        min={0}
        max={30000}
        step={500}
        aria-labelledby="budget-label"
      />
    </div>
  ),
})
