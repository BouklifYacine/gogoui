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
 *
 * @summary A multi-line field with its label.
 */
export const Basic = meta.story({
  render: () => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="message">Message au couple</Label>
      <Textarea id="message" placeholder="Bonjour Léa, bonjour Hugo…" />
    </div>
  ),
})
