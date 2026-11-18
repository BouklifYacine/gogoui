import { useState } from 'react'

import preview from '#.storybook/preview'

import { DateRangePicker } from './date-range-picker.tsx'

const meta = preview.meta({
  title: 'Formulaires/DateRangePicker',
  component: DateRangePicker,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A period in a two-month calendar; the button says it in words.
 *
 * @summary A period picked in a calendar.
 */
export const Basic = meta.story({
  render: function Render() {
    const [range, setRange] = useState<{ from?: string; to?: string }>({
      from: '2027-06-01',
      to: '2027-06-30',
    })
    return (
      <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
    )
  },
})
