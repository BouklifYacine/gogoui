import preview from '#.storybook/preview'

import { Input } from './input.tsx'
import { Label } from './label.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/Label',
  component: Label,
})

/**
 * The name of a field, above it, linked by `htmlFor`: a click on it puts
 * the focus in the field.
 */
export const Basic = meta.story({
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="venue">Nom du lieu</Label>
      <Input id="venue" placeholder="Domaine des Tilleuls" />
    </div>
  ),
})
