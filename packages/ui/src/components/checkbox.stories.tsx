import preview from '#.storybook/preview'

import { Checkbox } from './checkbox.tsx'
import { Label } from './label.tsx'

const meta = preview.meta({
  title: 'Composants/Checkbox',
  component: Checkbox,
  render: (args) => (
    <div className="flex items-center gap-3">
      <Checkbox id="story-checkbox" {...args} />
      <Label htmlFor="story-checkbox">Envoyer le devis par e-mail</Label>
    </div>
  ),
})

/**
 * A yes or no saved with the form, next to its label.
 *
 * @summary A labelled box to tick.
 */
export const Basic = meta.story({})

/**
 * Already ticked.
 *
 * @summary A ticked box.
 */
export const Checked = meta.story({ args: { defaultChecked: true } })

/**
 * The box at the head of a list when only some rows are ticked: a dash,
 * not a tick.
 *
 * @summary Some rows of a list ticked.
 */
export const Indeterminate = meta.story({ args: { indeterminate: true } })
