import { useState } from 'react'

import preview from '#.storybook/preview'

import { SwitchField } from './switch-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/SwitchField',
  component: SwitchField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * A setting inside a form, saved with it.
 */
export const Basic = meta.story({
  args: {
    name: 'reminders',
    label: 'Rappels automatiques',
    description: 'Un e-mail au couple 7 jours avant chaque échéance.',
    error: '',
    value: true,
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <SwitchField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
