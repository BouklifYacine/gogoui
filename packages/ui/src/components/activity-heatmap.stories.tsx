import { useState } from 'react'

import preview from '#.storybook/preview'

import { ActivityHeatmap } from './activity-heatmap.tsx'
import type { ActivityDay } from './activity-heatmap.tsx'
import { Button } from './button.tsx'

/** The same « random » year on every load. */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A wedding venue's events per day for a year: weddings on summer
 * Fridays and Saturdays, seminars on weekdays out of season, quiet
 * winters.
 */
function venueYear(year: number): ActivityDay[] {
  const random = seeded(year)
  const days: ActivityDay[] = []
  for (
    let time = Date.UTC(year, 0, 1);
    time < Date.UTC(year + 1, 0, 1);
    time += 86_400_000
  ) {
    const date = new Date(time)
    const month = date.getUTCMonth()
    const weekday = date.getUTCDay()
    const season = month >= 4 && month <= 8
    const weekend = weekday === 5 || weekday === 6
    const chance = weekend
      ? season
        ? 0.92
        : 0.35
      : weekday === 0
        ? 0.2
        : season
          ? 0.12
          : 0.22
    const count =
      random() < chance ? 1 + (weekend && season && random() < 0.4 ? 1 : 0) : 0
    days.push({ date: date.toISOString().slice(0, 10), count })
  }
  return days
}

const year2026 = venueYear(2026)
const year2025 = venueYear(2025)
const events = { one: 'événement', other: 'événements' }

const meta = preview.meta({
  title: 'Charts/ActivityHeatmap',
  tags: ['beta'],
  component: ActivityHeatmap,
  args: {
    days: year2026,
    label: 'Événements par jour en 2026',
    period: 'en 2026',
    unit: events,
    weekStartsOn: 1,
    color: 'chart-1',
  },
  argTypes: {
    weekStartsOn: { control: 'inline-radio', options: [1, 0] },
  },
  render: (args) => (
    <div className="max-w-4xl rounded-xl border border-line bg-surface p-5">
      <ActivityHeatmap {...args} />
    </div>
  ),
})

/**
 * A year of events, weeks from Monday: the busy wedding season shows at
 * a glance. Point at a day, or tab in and use the arrows; the scale
 * highlights a level.
 */
export const Basic = meta.story({})

/**
 * Choosable days: a click, Enter or Space picks a day and a ring marks
 * it.
 */
export const Selectable = meta.story({
  render: function Render(args) {
    const [date, setDate] = useState<string | null>('2026-06-13')
    return (
      <div className="grid max-w-4xl gap-3 rounded-xl border border-line bg-surface p-5">
        <ActivityHeatmap {...args} selectedDate={date} onSelectDate={setDate} />
        <p className="text-sm text-fg-muted">Jour choisi : {date ?? 'aucun'}</p>
      </div>
    )
  },
})

/**
 * Fixed levels: 1, 2 and 3 events at most, the fourth above.
 */
export const FixedLevels = meta.story({
  args: { thresholds: [1, 2, 3], color: 'success' },
})

/**
 * The squares wave in once seen; one tooltip glides from day to day;
 * another year recolours the grid in a sweep, forward or back, and the
 * total's digits roll.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [year, setYear] = useState<2025 | 2026>(2026)
    return (
      <div className="max-w-4xl rounded-xl border border-line bg-surface p-5">
        <ActivityHeatmap
          {...args}
          days={year === 2026 ? year2026 : year2025}
          label={`Événements par jour en ${year}`}
          period={`en ${year}`}
          actions={
            <div className="flex gap-1">
              {([2025, 2026] as const).map((each) => (
                <Button
                  key={each}
                  size="sm"
                  variant={each === year ? 'default' : 'outline'}
                  onClick={() => setYear(each)}
                >
                  {each}
                </Button>
              ))}
            </div>
          }
        />
      </div>
    )
  },
})
