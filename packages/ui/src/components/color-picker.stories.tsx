import { useState } from 'react'

import preview from '#.storybook/preview'

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerTrigger,
} from './color-picker.tsx'
import type { ColorSwatch } from './color-picker.tsx'

const meta = preview.meta({
  title: 'Composants/ColorPicker',
  component: ColorPicker,
  decorators: [(Story) => <div className="min-h-120">{Story()}</div>],
})

/**
 * A free colour: the button, then the full panel. Every option is in the
 * controls: name, size, formats, opacity, contrast background.
 */
export const Basic = meta.story({
  args: {
    value: '#2F6BFF',
    onValueChange: () => {},
    label: 'Accent',
    size: 'default',
    disabled: false,
    alpha: false,
    formats: ['hex', 'rgb', 'hsl', 'oklch'],
    contrastWith: '#FFFFFF',
    maxSwatches: 7,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <ColorPicker {...args} value={value} onValueChange={setValue} />
  },
})

const saved: ColorSwatch[] = [
  { id: 'sage', color: '#8FA98B' },
  { id: 'terracotta', color: '#C8643B' },
  { id: 'night', color: '#1F2A44' },
]

/**
 * The panel grows out of the swatch, its content arriving behind the
 * edge. Click the area: the thumb settles on a spring; drag it: it stays
 * under the finger and grows. The format button morphs « HEX » into
 * « RGB » and the value with it; a wrong value shakes the field; the
 * contrast counts up and its level rolls; saved colours pop in and can be
 * dragged.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [value, setValue] = useState('#C8643B')
    const [swatches, setSwatches] = useState(saved)
    return (
      <ColorPicker
        label="Couleur de la page"
        value={value}
        onValueChange={setValue}
        formats={['hex', 'rgb', 'hsl', 'oklch']}
        alpha
        contrastWith="#FFFFFF"
        swatches={swatches}
        onSwatchesChange={setSwatches}
      />
    )
  },
})

/**
 * Only the parts you need, in your order: here the area, the hue and the
 * typed value.
 */
export const Composed = meta.story({
  render: function Render() {
    const [value, setValue] = useState('#1F2A44')
    return (
      <ColorPicker
        label="Texte"
        size="sm"
        value={value}
        onValueChange={setValue}
      >
        <ColorPickerTrigger />
        <ColorPickerContent>
          <ColorPickerArea />
          <ColorPickerHue />
          <ColorPickerInput />
        </ColorPickerContent>
      </ColorPicker>
    )
  },
})

/**
 * Disabled: the button stays readable, nothing opens.
 */
export const Disabled = meta.story({
  args: {
    value: '#8FA98B',
    onValueChange: () => {},
    label: 'Accent',
    disabled: true,
  },
})
