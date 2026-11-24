import {
  CalendarCheckIcon,
  CurrencyEurIcon,
  XCircleIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { StatCard } from './stat-card.tsx'

const meta = preview.meta({
  title: 'Affichage/StatCard',
  component: StatCard,
  parameters: { layout: 'padded' },
})

/**
 * One figure: change its words, its change and its colour in the
 * controls.
 */
export const Basic = meta.story({
  args: {
    label: 'Demandes ce mois-ci',
    value: '24',
    change: 0.2,
    changeLabel: 'vs octobre',
    lowerIsBetter: false,
    color: 'info',
    icon: <CalendarCheckIcon />,
  },
  decorators: [(Story) => <div className="w-64">{Story()}</div>],
})

/**
 * Three figures of a month, each against the month before. Fewer
 * cancellations is good news: it shows in green.
 */
export const Dashboard = meta.story({
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
      <StatCard
        label="Demandes ce mois-ci"
        value="24"
        change={0.2}
        changeLabel="vs octobre"
        icon={<CalendarCheckIcon />}
      />
      <StatCard
        label="Chiffre signé"
        value="86 400 €"
        change={-0.08}
        changeLabel="vs octobre"
        icon={<CurrencyEurIcon />}
      />
      <StatCard
        label="Annulations"
        value="2"
        change={-0.5}
        changeLabel="vs octobre"
        lowerIsBetter
        icon={<XCircleIcon />}
      />
    </div>
  ),
})
