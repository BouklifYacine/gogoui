import preview from '#.storybook/preview'

import { Label } from './label.tsx'
import { Textarea } from './textarea.tsx'

const meta = preview.meta({
  title: 'Composants/Textarea',
  component: Textarea,
})

/**
 * A message of several lines, under its label; the field grows with the
 * text.
 */
export const Basic = meta.story({
  args: {
    placeholder: 'Bonjour Léa, bonjour Hugo…',
    rows: 3,
    disabled: false,
    'aria-invalid': false,
  },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="message">Message au couple</Label>
      <Textarea {...args} id="message" />
    </div>
  ),
})
