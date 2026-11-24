import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { Checkbox } from './checkbox.tsx'
import { Label } from './label.tsx'

const meta = preview.meta({
  title: 'Formulaires/Saisie/Checkbox',
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
 */
export const Basic = meta.story({})

/**
 * Already ticked.
 */
export const Checked = meta.story({ args: { defaultChecked: true } })

/**
 * The box at the head of a list when only some rows are ticked: a dash,
 * not a tick.
 */
export const Indeterminate = meta.story({ args: { indeterminate: true } })

/**
 * Tick it: the fill grows from .6 and the tick draws itself; the button
 * turns the tick into a dash and back (one path morphing), a press
 * squeezes the box.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [state, setState] = useState<'off' | 'on' | 'some'>('on')
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="story-checkbox-motion"
            checked={state === 'on'}
            indeterminate={state === 'some'}
            onCheckedChange={(next) => setState(next ? 'on' : 'off')}
          />
          <Label htmlFor="story-checkbox-motion">Tous les invités</Label>
        </div>
        <Button
          variant="outline"
          onClick={() => setState((now) => (now === 'some' ? 'on' : 'some'))}
        >
          Coche ↔ tiret
        </Button>
      </div>
    )
  },
})
