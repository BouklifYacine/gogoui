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
 *
 * @summary Several choices among cards.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState<string[]>(['ceremony'])
    return (
      <CheckboxCardField
        name="spaces"
        legend="Espaces souhaités"
        description="Plusieurs réponses possibles"
        options={[
          { value: 'ceremony', label: 'Cérémonie laïque' },
          { value: 'cocktail', label: 'Vin d’honneur' },
          { value: 'dinner', label: 'Dîner' },
          { value: 'brunch', label: 'Brunch du lendemain' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
