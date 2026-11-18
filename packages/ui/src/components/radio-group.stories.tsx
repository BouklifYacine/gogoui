import preview from '#.storybook/preview'

import { COLORS } from '../internal/colors.ts'

import { Label } from './label.tsx'
import { RadioGroup, RadioGroupItem } from './radio-group.tsx'

const meta = preview.meta({
  title: 'Composants/RadioGroup',
  component: RadioGroup,
})

/**
 * Three choices seen at once, each with its own label; the group named by
 * a visible title.
 *
 * @summary One of a few visible options.
 */
export const Basic = meta.story({
  render: () => (
    <div className="grid gap-3">
      <span id="deposit-label" className="text-sm font-medium">
        Acompte demandé
      </span>
      <RadioGroup defaultValue="30" aria-labelledby="deposit-label">
        {['20', '30', '50'].map((rate) => (
          <div key={rate} className="flex items-center gap-3">
            <RadioGroupItem value={rate} id={`deposit-${rate}`} />
            <Label htmlFor={`deposit-${rate}`}>{rate} %</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  ),
})

/**
 * The chosen dot in each colour of the palette (`color` on the item).
 *
 * @summary A chosen option in every colour.
 */
export const Colors = meta.story({
  render: () => (
    <div className="flex gap-4">
      {COLORS.map((color) => (
        <RadioGroup key={color} defaultValue="on" aria-label={color}>
          <RadioGroupItem value="on" color={color} aria-label={color} />
        </RadioGroup>
      ))}
    </div>
  ),
})
