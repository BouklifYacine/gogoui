import preview from '#.storybook/preview'

import { Meter, MeterLabel, MeterValue } from './meter.tsx'

const meta = preview.meta({
  title: 'Composants/Meter',
  component: Meter,
  subcomponents: { MeterLabel, MeterValue },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * The Saturdays already booked this year; change the value and colour in
 * the controls.
 *
 * @summary A measure within a range.
 */
export const Basic = meta.story({
  args: {
    value: 34,
    min: 0,
    max: 52,
    color: 'primary',
    children: (
      <>
        <MeterLabel>Samedis réservés</MeterLabel>
        <MeterValue>{(_formatted, value) => `${value} sur 52`}</MeterValue>
      </>
    ),
  },
})
