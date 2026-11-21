import { useState } from 'react'

import preview from '#.storybook/preview'

import { CheckboxCardField } from './checkbox-card-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/CheckboxCardField',
  component: CheckboxCardField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * Several answers among cards.
 */
export const Basic = meta.story({
  args: {
    name: 'spaces',
    legend: 'Espaces souhaités',
    description: 'Plusieurs réponses possibles',
    error: '',
    options: [
      { value: 'ceremony', label: 'Cérémonie laïque' },
      { value: 'cocktail', label: 'Vin d’honneur' },
      { value: 'dinner', label: 'Dîner' },
      { value: 'brunch', label: 'Brunch du lendemain' },
    ],
    value: ['ceremony'],
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <CheckboxCardField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
