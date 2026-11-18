import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'

import preview from '#.storybook/preview'

import { Calendar, CalendarDayButton } from './calendar.tsx'

const meta = preview.meta({
  title: 'Composants/Calendar',
  component: Calendar,
  args: { locale: fr, defaultMonth: new Date(2027, 5, 1) },
})

/**
 * One day to pick. Every option is in the controls: colour, months shown,
 * week numbers, first day of the week, outside days, fixed weeks.
 *
 * @summary Pick one day.
 */
export const Basic = meta.story({
  args: {
    mode: 'single',
    selected: new Date(2027, 5, 12),
    color: 'primary',
    numberOfMonths: 1,
    showWeekNumber: false,
    showOutsideDays: true,
    fixedWeeks: false,
    weekStartsOn: 1,
  },
})

/**
 * A stay: first and last days filled, the days between tinted. Two to
 * fourteen nights (`min`, `max`), never across a booked day
 * (`excludeDisabled`).
 *
 * @summary Pick a stay of 2 to 14 nights.
 */
export const Range = meta.story({
  render: function Render(args) {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(2027, 5, 11),
      to: new Date(2027, 5, 13),
    })
    return (
      <Calendar
        {...args}
        mode="range"
        min={2}
        max={14}
        excludeDisabled
        disabled={[new Date(2027, 5, 20), new Date(2027, 5, 21)]}
        selected={range}
        onSelect={setRange}
      />
    )
  },
})

/**
 * Several separate days (visit slots), up to five.
 *
 * @summary Pick several days.
 */
export const Multiple = meta.story({
  render: function Render(args) {
    const [days, setDays] = useState<Date[] | undefined>([
      new Date(2027, 5, 4),
      new Date(2027, 5, 11),
    ])
    return (
      <Calendar
        {...args}
        mode="multiple"
        max={5}
        selected={days}
        onSelect={setDays}
      />
    )
  },
})

/**
 * Month and year in lists, to jump to a wedding two years away.
 *
 * @summary Month and year dropdowns.
 */
export const Dropdowns = meta.story({
  args: {
    mode: 'single',
    captionLayout: 'dropdown',
    startMonth: new Date(2026, 0),
    endMonth: new Date(2030, 11),
  },
})

/**
 * Two months side by side, with the weeks' numbers.
 *
 * @summary Two months with week numbers.
 */
export const TwoMonths = meta.story({
  args: { mode: 'range', numberOfMonths: 2, showWeekNumber: true },
})

/**
 * Only Saturdays can be chosen, and no day in the past: the others are
 * greyed and skipped by the keyboard.
 *
 * @summary Only some days can be chosen.
 */
export const SaturdaysOnly = meta.story({
  args: {
    mode: 'single',
    disabled: [{ dayOfWeek: [0, 1, 2, 3, 4, 5] }, { before: new Date() }],
  },
})

const booked = [new Date(2027, 5, 5), new Date(2027, 5, 19)]
const held = [new Date(2027, 5, 12), new Date(2027, 5, 26)]

/**
 * Days marked by their state (`modifiers` and `modifiersClassNames`): booked
 * in red and not choosable, held in orange; the legend says it in words.
 *
 * @summary Booked and held days, with a legend.
 */
export const MarkedDays = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      <Calendar
        locale={fr}
        defaultMonth={new Date(2027, 5, 1)}
        mode="single"
        disabled={booked}
        modifiers={{ booked, held }}
        modifiersClassNames={{
          booked:
            '[&_button]:bg-danger-subtle [&_button]:text-danger-fg [&_button]:line-through',
          held: '[&_button]:bg-warning-subtle [&_button]:text-warning-fg',
        }}
      />
      <ul className="flex gap-4 text-sm text-fg-muted">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 rounded-sm bg-danger-subtle ring-1 ring-danger-line"
          />
          Réservé
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 rounded-sm bg-warning-subtle ring-1 ring-warning-line"
          />
          En option
        </li>
      </ul>
    </div>
  ),
})

/**
 * A price under each day (`components.DayButton`): the dearest Saturdays
 * at a glance.
 *
 * @summary A price under each day.
 */
export const Prices = meta.story({
  render: () => (
    <Calendar
      locale={fr}
      defaultMonth={new Date(2027, 5, 1)}
      mode="single"
      className="[--cell-size:--spacing(12)]"
      components={{
        DayButton: ({ children, ...props }) => (
          <CalendarDayButton {...props} locale={fr}>
            {children}
            <span className="tabular-nums">
              {props.day.date.getDay() === 6 ? '4,5k' : '2k'}
            </span>
          </CalendarDayButton>
        ),
      }}
    />
  ),
})
