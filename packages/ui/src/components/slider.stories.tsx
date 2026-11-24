import { useState } from 'react'
import { SpeakerHighIcon, SpeakerLowIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Slider } from './slider.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/Slider',
  component: Slider,
  args: { color: 'primary', size: 'default' },
  decorators: [(Story) => <div className="w-80 pt-8">{Story()}</div>],
})

/**
 * A number of guests by dragging, the value written next to its label.
 */
export const Basic = meta.story({
  args: {
    label: 'Invités',
    showValue: true,
    defaultValue: 150,
    min: 20,
    max: 300,
    step: 10,
  },
})

/**
 * A budget between two amounts: two thumbs, never closer than 1 000 €.
 */
export const Range = meta.story({
  render: (args) => (
    <Slider
      {...args}
      label="Budget"
      showValue
      defaultValue={[8000, 15000]}
      min={0}
      max={30000}
      step={500}
      minStepsBetweenValues={2}
      format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
    />
  ),
})

/**
 * Ticks on the track; the labelled ones are printed under it and take a
 * press.
 */
export const Marks = meta.story({
  render: (args) => (
    <Slider
      {...args}
      label="Acompte"
      showValue
      defaultValue={30}
      step={10}
      format={{ style: 'unit', unit: 'percent' }}
      marks={[
        { value: 0, label: '0 %' },
        10,
        20,
        { value: 30, label: '30 %' },
        40,
        { value: 50, label: '50 %' },
        60,
        70,
        80,
        90,
        { value: 100, label: '100 %' },
      ]}
    />
  ),
})

/**
 * The elastic variant: one value, icons at the ends, marks the thumb
 * clicks into.
 */
export const Elastic = meta.story({
  render: (args) => (
    <Slider
      {...args}
      variant="elastic"
      label="Volume"
      showValue
      defaultValue={40}
      start={<SpeakerLowIcon className="size-4" />}
      end={<SpeakerHighIcon className="size-4" />}
      marks={[25, 50, 75]}
    />
  ),
})

/**
 * Drag a thumb: it follows the finger exactly, grows, and a bubble with
 * rolling digits rides it; past an end it gives a few pixels. Let go fast
 * and it travels one step more. Press the track: the thumb glides there.
 * Tab to it and press → at the end: it bumps. Elastic: the track stretches
 * and thins past an end, the bubble trails and sways, marks hold the
 * thumb and pop.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [guests, setGuests] = useState<number | readonly number[]>(120)
    return (
      <div className="grid gap-10">
        <Slider
          {...args}
          label="Invités"
          showValue
          value={guests}
          onValueChange={setGuests}
          min={0}
          max={300}
          step={25}
          marks={[100, 200]}
        />
        <Slider
          {...args}
          variant="elastic"
          label="Marge"
          showValue
          defaultValue={3}
          min={0}
          max={10}
          marks={[
            { value: 0, label: '0 j' },
            { value: 5, label: '5 j' },
            { value: 10, label: '10 j' },
          ]}
        />
      </div>
    )
  },
})
