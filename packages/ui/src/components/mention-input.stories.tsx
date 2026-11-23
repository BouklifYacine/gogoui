import { useState } from 'react'

import preview from '#.storybook/preview'

import { Label } from './label.tsx'
import { MentionInput, serializeMentions } from './mention-input.tsx'
import type { MentionValue } from './mention-input.tsx'

const team = [
  { id: 'u1', name: 'Léa Martin', description: 'Gérante' },
  { id: 'u2', name: 'Hugo Bernard', description: 'Coordinateur' },
  { id: 'u3', name: 'Camille Durand', description: 'Traiteur' },
  { id: 'u4', name: 'Marie Lefèvre', description: 'Hébergement' },
  { id: 'u5', name: 'Thomas Petit', description: 'Régie' },
]

const meta = preview.meta({
  title: 'Composants/MentionInput',
  component: MentionInput,
  decorators: [(Story) => <div className="w-96 pb-72">{Story()}</div>],
})

/**
 * A note on a request: type @ then a name; ↑ ↓ and Enter choose.
 */
export const Basic = meta.story({
  args: {
    people: team,
    placeholder: 'Une note pour l’équipe… @ pour citer quelqu’un',
    minRows: 2,
    maxRows: 6,
    side: 'auto',
    color: 'primary',
    disabled: false,
  },
  render: function Render(args) {
    const [value, setValue] = useState<MentionValue>({
      text: '',
      mentions: [],
    })
    return (
      <div className="grid gap-2">
        <Label htmlFor="story-note">Note interne</Label>
        <MentionInput
          {...args}
          id="story-note"
          value={value}
          onValueChange={setValue}
        />
        <p className="text-xs text-fg-subtle">
          Enregistré : {serializeMentions(value) || '—'}
        </p>
      </div>
    )
  },
})

/**
 * With mentions already in the text: each is one block (one Backspace
 * removes it, the caret steps over it).
 */
export const WithMentions = meta.story({
  render: function Render() {
    const [value, setValue] = useState<MentionValue>({
      text: '@Léa Martin peux-tu rappeler le couple ? @Hugo Bernard prépare le devis.',
      mentions: [
        { id: 'u1', label: 'Léa Martin', start: 0, end: 11 },
        { id: 'u2', label: 'Hugo Bernard', start: 41, end: 54 },
      ],
    })
    return (
      <MentionInput
        aria-label="Note interne"
        people={team}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * What moves: the height follows the text on a spring, the list grows
 * from the @ and its highlight glides under the pointer.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState<MentionValue>({
      text: 'Pour la visite de samedi, ',
      mentions: [],
    })
    return (
      <MentionInput
        aria-label="Note interne"
        people={team}
        minRows={1}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
