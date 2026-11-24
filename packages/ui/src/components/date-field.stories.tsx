import { useState } from 'react'

import preview from '#.storybook/preview'

import { DateField } from './date-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Dates et heures/DateField',
  component: DateField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A day typed or picked; the weekday shows under it.
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
 * The calendar grows out of its button; a picked day closes it a beat
 * later, once the disc has glided; under the field, only the part of the
 * date that changed rolls (up for a later day, down for an earlier one).
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState<string | null>('2027-06-12')
    return (
      <DateField
        name="wedding"
        label="Date du mariage"
        color="primary"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Past days cannot be chosen, typed or picked.
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
