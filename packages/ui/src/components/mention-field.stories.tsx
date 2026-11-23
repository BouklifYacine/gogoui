import { useState } from 'react'

import preview from '#.storybook/preview'

import { MentionField } from './mention-field.tsx'
import type { MentionValue } from './mention-input.tsx'

const team = [
  { id: 'u1', name: 'Léa Martin', description: 'Gérante' },
  { id: 'u2', name: 'Hugo Bernard', description: 'Coordinateur' },
  { id: 'u3', name: 'Camille Durand', description: 'Traiteur' },
]

const meta = preview.meta({
  title: 'Formulaires/MentionField',
  component: MentionField,
  decorators: [(Story) => <div className="w-96 pb-60">{Story()}</div>],
})

/**
 * A labelled note with its help; the value is `{ text, mentions }`.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState<MentionValue>({
      text: '',
      mentions: [],
    })
    return (
      <MentionField
        name="note"
        label="Note interne"
        description="Tapez @ pour prévenir quelqu’un de l’équipe."
        people={team}
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
    const [value, setValue] = useState<MentionValue>({
      text: '',
      mentions: [],
    })
    return (
      <MentionField
        name="note"
        label="Note interne"
        error="Écrivez la note avant de l’enregistrer."
        people={team}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
