import { useState } from 'react'
import { BuildingsIcon, HouseLineIcon, TreeIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { RadioCardField } from './radio-card-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/RadioCardField',
  component: RadioCardField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

const kinds = [
  { value: 'castle', label: 'Château', icon: BuildingsIcon },
  { value: 'farm', label: 'Ferme', icon: HouseLineIcon },
  { value: 'garden', label: 'Jardin', icon: TreeIcon },
] as const

/**
 * A few choices seen at once, each a card with its icon.
 *
 * @summary One choice among cards.
 */
export const Cards = meta.story({
  render: function Render() {
    const [value, setValue] = useState<(typeof kinds)[number]['value'] | ''>('')
    return (
      <RadioCardField
        name="kind"
        legend="Type de lieu"
        options={kinds}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Two or three one-word choices on one line.
 *
 * @summary Short choices side by side.
 */
export const Inline = meta.story({
  render: function Render() {
    const [value, setValue] = useState<'day' | 'evening' | ''>('day')
    return (
      <RadioCardField
        name="moment"
        legend="Moment"
        inline
        options={[
          { value: 'day', label: 'Journée' },
          { value: 'evening', label: 'Soirée' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Many one-line choices in one framed list.
 *
 * @summary Many choices as a list.
 */
export const List = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <RadioCardField
        name="guests"
        legend="Nombre d'invités"
        list
        options={[
          { value: '50', label: 'Moins de 50' },
          { value: '100', label: '50 à 100' },
          { value: '150', label: '100 à 150' },
          { value: '200', label: 'Plus de 150' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
