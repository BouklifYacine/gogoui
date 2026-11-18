import { useState } from 'react'

import preview from '#.storybook/preview'

import { SwitchField } from './switch-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/SwitchField',
  component: SwitchField,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * A setting inside a form, saved with it.
 *
 * @summary A setting turned on or off.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState(true)
    return (
      <SwitchField
        name="reminders"
        label="Rappels automatiques"
        description="Un e-mail au couple 7 jours avant chaque échéance."
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
