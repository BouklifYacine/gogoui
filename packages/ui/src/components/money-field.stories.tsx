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
 *
 * @summary A labelled amount.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <MoneyField
        name="deposit"
        label="Acompte"
        description="Par exemple 1 500,00"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
