import preview from '#.storybook/preview'

import { Label } from './label.tsx'
import { NumberField } from './number-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/NumberField',
  component: NumberField,
})

/**
 * A guest count between 1 and 300, by tens with the buttons.
 *
 * @summary A number with − and +.
 */
export const Basic = meta.story({
  args: {
    defaultValue: 120,
    min: 1,
    max: 300,
    step: 10,
    disabled: false,
    size: 'default',
  },
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="guests">Invités</Label>
      <NumberField {...args} id="guests" />
    </div>
  ),
})

/**
 * A price, formatted as money.
 *
 * @summary A formatted amount.
 */
export const Money = meta.story({
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="price">Prix par invité</Label>
      <NumberField
        id="price"
        defaultValue={85}
        min={0}
        step={5}
        format={{ style: 'currency', currency: 'EUR' }}
      />
    </div>
  ),
})
