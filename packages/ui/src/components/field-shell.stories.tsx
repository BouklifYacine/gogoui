import { useState } from 'react'

import preview from '#.storybook/preview'

import { FieldShell } from './field-shell.tsx'
import { Slider } from './slider.tsx'

const meta = preview.meta({
  title: 'Formulaires/FieldShell',
  component: FieldShell,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A control of your own (here a slider) gets its label, help and error
 * links from the shell.
 */
export const CustomControl = meta.story({
  render: function Render() {
    const [value, setValue] = useState(120)
    return (
      <FieldShell
        name="guests"
        label={`Invités : ${String(value)}`}
        description="De 20 à 300"
      >
        {(control) => (
          <Slider
            {...control}
            min={20}
            max={300}
            value={value}
            onValueChange={(next) => setValue(next as number)}
          />
        )}
      </FieldShell>
    )
  },
})
