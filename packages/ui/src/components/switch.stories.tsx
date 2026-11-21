import preview from '#.storybook/preview'

import { Label } from './label.tsx'
import { Switch } from './switch.tsx'

const meta = preview.meta({
  title: 'Composants/Switch',
  component: Switch,
  render: (args) => (
    <div className="flex items-center gap-3">
      <Switch id="story-switch" {...args} />
      <Label htmlFor="story-switch">Recevoir un e-mail à chaque demande</Label>
    </div>
  ),
})

/**
 * A setting that applies at once, without a save button.
 */
export const Basic = meta.story({})

/**
 * The setting already on.
 */
export const Checked = meta.story({ args: { defaultChecked: true } })
