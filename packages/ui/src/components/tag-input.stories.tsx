import { useState } from 'react'

import preview from '#.storybook/preview'

import { Label } from './label.tsx'
import { TagInput } from './tag-input.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/TagInput',
  tags: ['beta'],
  component: TagInput,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * Keywords under their label: Enter or a comma adds one, × removes it.
 */
export const Basic = meta.story({
  args: {
    placeholder: 'Ajouter un mot-clé',
    size: 'default',
    color: 'primary',
    disabled: false,
    defaultValue: ['Mariage', 'Champêtre'],
  },
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="story-tags">Mots-clés</Label>
      <TagInput {...args} id="story-tags" />
    </div>
  ),
})

/**
 * Empty: the placeholder shows, and rises back when the last tag leaves.
 */
export const Empty = meta.story({
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="story-tags-empty">Mots-clés</Label>
      <TagInput id="story-tags-empty" placeholder="Ajouter un mot-clé" />
    </div>
  ),
})

/**
 * The three heights: sm, default, lg (44px on a phone for all).
 */
export const Sizes = meta.story({
  render: () => (
    <div className="grid gap-3">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <TagInput
          key={size}
          size={size}
          aria-label={`Mots-clés ${size}`}
          defaultValue={['Mariage', 'Séminaire']}
        />
      ))}
    </div>
  ),
})

/**
 * Disabled: the tags stay readable, nothing can change.
 */
export const Disabled = meta.story({
  render: () => (
    <TagInput
      aria-label="Mots-clés"
      disabled
      defaultValue={['Mariage', 'Champêtre']}
    />
  ),
})

/**
 * What moves: a new tag blurs in while the caret glides aside, a removed
 * one leaves and the others glide in, the height follows the rows, a
 * duplicate pulses, and Backspace then ← → glide the ring from tag to tag.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [tags, setTags] = useState([
      'Mariage',
      'Champêtre',
      'Piscine',
      'Hébergement',
    ])
    return (
      <div className="grid gap-2">
        <Label htmlFor="story-tags-moving">Mots-clés</Label>
        <TagInput
          id="story-tags-moving"
          placeholder="Ajouter un mot-clé"
          value={tags}
          onValueChange={setTags}
        />
      </div>
    )
  },
})
