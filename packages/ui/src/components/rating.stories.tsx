import { useState } from 'react'

import preview from '#.storybook/preview'

import { Rating } from './rating.tsx'
import { RatingField } from './rating-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/Rating',
  tags: ['beta'],
  component: Rating,
  args: {
    value: 3,
    max: 5,
    size: 'default',
    color: 'warning',
    allowHalf: false,
    allowClear: true,
    showValue: true,
    readOnly: false,
    disabled: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <Rating {...args} value={value} onValueChange={setValue} />
  },
})

/**
 * Five stars with the value's word beside them.
 */
export const Basic = meta.story({})

/**
 * The pointer, a finger and the arrows move by half stars.
 */
export const HalfStars = meta.story({ args: { allowHalf: true, value: 3.5 } })

/**
 * Shown, not chosen: one image named by its value.
 */
export const ReadOnly = meta.story({ args: { readOnly: true, value: 4 } })

/**
 * The three sizes.
 */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Rating value={4} readOnly size="sm" />
      <Rating value={4} readOnly />
      <Rating value={4} readOnly size="lg" />
    </div>
  ),
})

/**
 * In a form, with its label, help and error.
 */
export const Field = meta.story({
  render: function Render() {
    const [value, setValue] = useState(0)
    return (
      <RatingField
        name="review"
        label="Votre avis sur la soirée"
        description="De 1 (mauvais) à 5 (excellent)."
        error={value === 0 ? 'Choisissez une note.' : undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Point at the stars: the fill sweeps one star after the other and a faint
 * mark keeps the chosen value. Choose: the star pops (the whole row in a
 * wave after a pause); a press sinks it; the word rolls.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: { value: 0, size: 'lg' },
})
