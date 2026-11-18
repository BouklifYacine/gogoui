import { useState } from 'react'

import preview from '#.storybook/preview'

import { DateRangePicker, useDateRangePresets } from './date-range-picker.tsx'

const meta = preview.meta({
  title: 'Formulaires/DateRangePicker',
  component: DateRangePicker,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A period in a two-month calendar; the button says it in words. Change
 * its colour and its shortest and longest period in the controls.
 *
 * @summary A period picked in a calendar.
 */
export const Basic = meta.story({
  args: {
    from: '2027-06-01',
    to: '2027-06-30',
    color: 'primary',
    minDays: undefined,
    maxDays: undefined,
    onChange: () => {},
  },
  render: function Render(args) {
    const [range, setRange] = useState<{ from?: string; to?: string }>({
      from: args.from,
      to: args.to,
    })
    return (
      <DateRangePicker
        {...args}
        from={range.from}
        to={range.to}
        onChange={setRange}
      />
    )
  },
})

/**
 * The usual shortcuts beside the months (`useDateRangePresets()`): one
 * click for the last 7 days, this month, last month.
 *
 * @summary A period with shortcuts.
 */
export const WithPresets = meta.story({
  render: function Render() {
    const presets = useDateRangePresets()
    const [range, setRange] = useState<{ from?: string; to?: string }>({})
    return (
      <DateRangePicker
        presets={presets}
        from={range.from}
        to={range.to}
        onChange={setRange}
      />
    )
  },
})
