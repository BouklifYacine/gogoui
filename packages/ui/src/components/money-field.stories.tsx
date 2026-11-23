import { useState } from 'react'

import preview from '#.storybook/preview'

import { MoneyField } from './money-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/MoneyField',
  component: MoneyField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * An amount, typed with spaces and a comma; the example sits in the help.
 */
export const Basic = meta.story({
  args: {
    name: 'deposit',
    label: 'Acompte',
    description: 'Par exemple 1 500,00',
    error: '',
    required: false,
    value: '',
    size: 'default',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <MoneyField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Chips that add to the amount, and its range written under the field.
 */
export const QuickAdd = meta.story({
  render: function Render() {
    const [value, setValue] = useState('250')
    return (
      <MoneyField
        label="Budget"
        value={value}
        onValueChange={setValue}
        quickAdd={[50, 100, 500]}
        min={100}
        max={5000}
      />
    )
  },
})

/**
 * Type « 1234 »: the space comes as the thousands do, the caret stays put,
 * and « ,00 » waits in pale ghosts. Press a chip: each column rolls up to
 * its new digit. Past 5 000 € the amount kicks sideways and the range
 * flashes.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('4 850')
    return (
      <MoneyField
        label="Caution"
        value={value}
        onValueChange={setValue}
        quickAdd={[10, 50, 100]}
        max={5000}
      />
    )
  },
})
