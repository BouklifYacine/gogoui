import { useState } from 'react'
import { EnvelopeSimpleIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { TextField } from './text-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/TextField',
  component: TextField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A name: label above, value kept by the page (`useState` or a form
 * library).
 */
export const Basic = meta.story({
  args: {
    name: 'venue',
    label: 'Nom du lieu',
    description: '',
    error: '',
    placeholder: '',
    disabled: false,
    size: 'default',
    autoComplete: 'organization',
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <TextField
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
 * An e-mail with its icon, a line of help and an error that says what to
 * do.
 */
export const WithError = meta.story({
  render: function Render() {
    const [value, setValue] = useState('marie@')
    return (
      <TextField
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        icon={EnvelopeSimpleIcon}
        description="Les devis partent à cette adresse."
        error="Ajoutez la fin de l'adresse, par exemple marie@exemple.fr."
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Uncontrolled: `defaultValue` and no state to write. The field keeps what
 * is typed; the form sends it by its `name`, and `onValueChange` (optional)
 * still hears each change.
 */
export const Uncontrolled = meta.story({
  render: () => (
    <TextField
      name="city"
      label="Ville"
      autoComplete="address-level2"
      defaultValue="Lyon"
    />
  ),
})

/**
 * The help and the error slide in under the field: the row opens on a
 * spring, the words rise into place, and only the changed words move as
 * the message changes (the count rolls).
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('')
    const missing = Math.max(0, 6 - value.length)
    return (
      <TextField
        name="code"
        label="Code du lieu"
        description={value ? undefined : 'Six caractères, sur votre devis.'}
        error={
          value && missing > 0
            ? `Encore ${String(missing)} caractères à saisir.`
            : undefined
        }
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
