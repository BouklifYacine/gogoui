import { useState } from 'react'

import preview from '#.storybook/preview'

import { MultiSelectField } from './multi-select-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/MultiSelectField',
  tags: ['beta'],
  component: MultiSelectField,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

const spaces = [
  { value: 'orangerie', label: 'Orangerie' },
  { value: 'grange', label: 'Grange' },
  { value: 'parc', label: 'Parc' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'chapelle', label: 'Chapelle' },
  { value: 'salon-bleu', label: 'Salon bleu' },
] as const

/**
 * The spaces a date takes: two chips, then « +N ».
 */
export const Basic = meta.story({
  args: {
    name: 'spaces',
    label: 'Espaces réservés',
    description: '',
    error: '',
    placeholder: 'Choisir des espaces',
    maxVisible: 2,
    required: false,
    disabled: false,
    size: 'default',
    options: spaces,
    value: ['orangerie', 'parc'],
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <MultiSelectField
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
 * Nothing chosen yet: the placeholder, no ×.
 */
export const Empty = meta.story({
  render: function Render() {
    const [value, setValue] = useState<string[]>([])
    return (
      <MultiSelectField
        label="Espaces réservés"
        options={spaces}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Invalid: the edge turns red and the error says why.
 */
export const Invalid = meta.story({
  render: function Render() {
    const [value, setValue] = useState<string[]>([])
    return (
      <MultiSelectField
        label="Espaces réservés"
        options={spaces}
        value={value}
        onValueChange={setValue}
        error="Choisissez au moins un espace."
      />
    )
  },
})

/**
 * Pick and let go: each chip opens its place on a spring and its
 * neighbours slide, « +N » rolls up or down, the tick draws itself and
 * retracts, the × pops in.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState<string[]>(['grange'])
    return (
      <MultiSelectField
        label="Espaces réservés"
        options={spaces}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
