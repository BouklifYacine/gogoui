import { useState } from 'react'

import preview from '#.storybook/preview'

import { TagField } from './tag-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Champs prêts/TagField',
  tags: ['beta'],
  component: TagField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Keywords with their label and help, the value kept by the page.
 */
export const Basic = meta.story({
  args: {
    name: 'keywords',
    label: 'Mots-clés',
    description: 'Entrée ou virgule pour ajouter.',
    error: '',
    placeholder: 'Ajouter un mot-clé',
    disabled: false,
    value: ['Mariage'],
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <TagField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Addresses to notify: `validate` refuses what is not an e-mail and the
 * reason shows as the error until the text changes; `max` stops at five.
 */
export const EmailAddresses = meta.story({
  render: function Render() {
    const [value, setValue] = useState(['lea@exemple.fr'])
    return (
      <TagField
        name="notify"
        label="Prévenir aussi"
        placeholder="Ajouter une adresse"
        max={5}
        validate={(tag) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag)
            ? undefined
            : `« ${tag} » n'est pas une adresse e-mail.`
        }
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * An error from the form, linked to the field.
 */
export const WithError = meta.story({
  render: function Render() {
    const [value, setValue] = useState<string[]>([])
    return (
      <TagField
        name="keywords"
        label="Mots-clés"
        placeholder="Ajouter un mot-clé"
        error="Ajoutez au moins un mot-clé."
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
