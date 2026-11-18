import { useState } from 'react'

import preview from '#.storybook/preview'

import { DateField } from './date-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/DateField',
  component: DateField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A day typed or picked; the weekday shows under it.
 *
 * @summary A labelled day.
 */
export const Basic = meta.story({
  args: {
    name: 'date',
    label: "Date de l'événement",
    description: '',
    error: '',
    disabled: false,
    required: false,
    value: '2027-06-12',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <DateField
        {...args}
        description={args.description || undefined}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Past days cannot be chosen, typed or picked.
 *
 * @summary Only days to come.
 */
export const FutureOnly = meta.story({
  render: function Render() {
    const [value, setValue] = useState<string | null>(null)
    return (
      <DateField
        name="visit"
        label="Date de la visite"
        disabledDates={{ before: new Date() }}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
