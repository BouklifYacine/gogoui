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
  args: {
    name: 'start',
    label: 'Début de la cérémonie',
    description: '',
    error: '',
    value: '14:30',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <TimeField
        {...args}
        description={args.description || undefined}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
