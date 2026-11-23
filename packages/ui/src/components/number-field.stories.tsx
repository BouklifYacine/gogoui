import { useState } from 'react'

import preview from '#.storybook/preview'

import { Label } from './label.tsx'
import { NumberField, NumberFieldScrubArea } from './number-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/NumberField',
  component: NumberField,
})

/**
 * A guest count between 1 and 300, by tens with the buttons.
 */
export const Basic = meta.story({
  args: {
    defaultValue: 120,
    min: 1,
    max: 300,
    step: 10,
    disabled: false,
    size: 'default',
    limitHint: true,
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

/**
 * Words after the number that follow it: « 1 nuit », « 2 nuits ».
 */
export const WithSuffix = meta.story({
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="nights">Durée</Label>
      <NumberField
        id="nights"
        defaultValue={1}
        min={1}
        max={14}
        size="lg"
        suffix={(nights) => (nights > 1 ? ' nuits' : ' nuit')}
      />
    </div>
  ),
})

/**
 * The label inside the field: drag it sideways to change the number, one
 * step every 6 px.
 */
export const ScrubLabel = meta.story({
  render: () => (
    <NumberField id="rooms" defaultValue={12} min={0} max={40}>
      <NumberFieldScrubArea>
        <Label htmlFor="rooms">Chambres</Label>
      </NumberFieldScrubArea>
    </NumberField>
  ),
})

/**
 * Press + or −: each digit rolls on its wheel the way the number moved, a
 * new column opens (99 → 100). At 10, + is dimmed: a press there kicks the
 * number up and back, the + shakes and « Max 10 » shows a moment.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState<number | null>(8)
    return (
      <div className="grid gap-2">
        <Label htmlFor="tables">Tables</Label>
        <NumberField
          id="tables"
          value={value}
          onValueChange={setValue}
          min={0}
          max={10}
          suffix={(count) => (count > 1 ? ' tables' : ' table')}
        />
      </div>
    )
  },
})
