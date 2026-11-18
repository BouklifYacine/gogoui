import { fr } from 'react-day-picker/locale'

import preview from '#.storybook/preview'

import { Calendar } from './calendar.tsx'

const meta = preview.meta({
  title: 'Composants/Calendar',
  component: Calendar,
})

/**
 * One day to pick, the month and day names in French.
 *
 * @summary Pick one day.
 */
export const Basic = meta.story({
  args: {
    mode: 'single',
    locale: fr,
    defaultMonth: new Date(2027, 5, 1),
    selected: new Date(2027, 5, 12),
  },
})

/**
 * A stay from one day to another: the first and last days filled, the
 * days between tinted.
 *
 * @summary Pick a range of days.
 */
export const Range = meta.story({
  args: {
    mode: 'range',
    locale: fr,
    defaultMonth: new Date(2027, 5, 1),
    selected: { from: new Date(2027, 5, 11), to: new Date(2027, 5, 13) },
  },
})
