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
 *
 * @summary Accepting the terms.
 */
export const Consent = meta.story({
  render: function Render() {
    const [value, setValue] = useState(false)
    return (
      <CheckboxField
        name="terms"
        label={
          <>
            J'accepte les{' '}
            <a href="#cgu" className="underline underline-offset-4">
              conditions d'utilisation
            </a>
          </>
        }
        error={value ? undefined : 'Cochez la case pour créer votre compte.'}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
