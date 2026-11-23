import { useState } from 'react'

import preview from '#.storybook/preview'

import { ColorPickerField } from './color-picker-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/ColorPickerField',
  tags: ['beta'],
  component: ColorPickerField,
  decorators: [(Story) => <div className="min-h-120 w-80">{Story()}</div>],
})

/**
 * A free colour in a form: label, help and error, the panel under the
 * button. Change the texts and options in the controls.
 */
export const Basic = meta.story({
  args: {
    name: 'brandColor',
    label: 'Couleur de la marque',
    description: 'Elle colore les boutons de la page publique.',
    error: '',
    disabled: false,
    value: '#2F6BFF',
    onValueChange: () => {},
    contrastWith: '#FFFFFF',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <ColorPickerField
        {...args}
        error={args.error || undefined}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})

/**
 * Invalid: the button is edged in red and the error is read with it.
 */
export const Invalid = meta.story({
  render: function Render() {
    const [value, setValue] = useState('#F4F4F5')
    return (
      <ColorPickerField
        name="buttonColor"
        label="Couleur des boutons"
        error="Trop pâle sur fond blanc : choisissez une couleur plus foncée."
        contrastWith="#FFFFFF"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
