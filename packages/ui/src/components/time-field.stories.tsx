import { useState } from 'react'

import preview from '#.storybook/preview'

import { TimeField } from './time-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/TimeField',
  component: TimeField,
  decorators: [(Story) => <div className="w-60">{Story()}</div>],
})

/**
 * A time picked by quarters, or typed (« 2210 » becomes « 22:10 »).
 *
 * @summary A labelled time.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('14:30')
    return (
      <TimeField
        name="start"
        label="Début de la cérémonie"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
