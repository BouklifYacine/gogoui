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
 */
export const Cards = meta.story({
  args: {
    name: 'kind',
    legend: 'Type de lieu',
    error: '',
    hideLegend: false,
    inline: false,
    list: false,
    options: kinds,
    value: '',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <RadioCardField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Two or three one-word choices on one line.
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
