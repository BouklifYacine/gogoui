import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { RollingNumber } from './rolling-number.tsx'

const meta = preview.meta({
  title: 'Composants/RollingNumber',
  component: RollingNumber,
  args: { value: 1280 },
})

/**
 * A number in the text size of its parent.
 */
export const Basic = meta.story({
  render: (args) => (
    <p className="text-3xl font-medium">
      <RollingNumber {...args} />
    </p>
  ),
})

/**
 * A price in euros, written by Intl in the provider's language.
 */
export const Currency = meta.story({
  args: {
    value: 49,
    format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
  },
  render: (args) => (
    <p className="text-3xl font-medium">
      <RollingNumber {...args} />
    </p>
  ),
})

/**
 * Up turns the wheels up, down turns them down; 999 → 1 000 opens a column
 * on the left and the ones stay on their wheel. The first view rolls every
 * digit up from 0, one after another.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState(996)
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-4xl font-medium">
          <RollingNumber value={value} animateOnView />
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setValue((v) => v - 1)}>
            −1
          </Button>
          <Button variant="outline" onClick={() => setValue((v) => v + 1)}>
            +1
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue(Math.round(Math.random() * 20000))}
          >
            Au hasard
          </Button>
        </div>
      </div>
    )
  },
})
