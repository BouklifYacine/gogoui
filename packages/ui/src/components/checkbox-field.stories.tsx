import { useState } from 'react'

import preview from '#.storybook/preview'

import { CheckboxField } from './checkbox-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/CheckboxField',
  component: CheckboxField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * A consent, its label holding a link to read first.
 */
export const Consent = meta.story({
  args: {
    name: 'terms',
    label: (
      <>
        J'accepte les{' '}
        <a href="#cgu" className="underline underline-offset-4">
          conditions d'utilisation
        </a>
      </>
    ),
    description: '',
    error: 'Cochez la case pour créer votre compte.',
    value: false,
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <CheckboxField
        {...args}
        description={args.description || undefined}
        error={value ? undefined : args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
