import { useState } from 'react'

import preview from '#.storybook/preview'

import { FilterDateRange } from './filter-date-range.tsx'
import { FilterMenu } from './filter-menu.tsx'

type Period = { from?: string; to?: string }

const meta = preview.meta({
  title: 'Filtres et recherche/FilterDateRange',
  component: FilterDateRange,
  decorators: [
    (Story) => <div className="w-[28rem] max-w-full">{Story()}</div>,
  ],
})

/**
 * A period typed in two fields or picked on the calendar; each end keeps
 * the other in order.
 */
export const Basic = meta.story({
  render: function Render() {
    const [period, setPeriod] = useState<Period>({
      from: '2027-03-01',
      to: '2027-03-31',
    })
    return (
      <FilterDateRange
        id="created"
        legend="Date de création"
        from={period.from}
        to={period.to}
        onChange={setPeriod}
      />
    )
  },
})

/**
 * In a `FilterMenu`: the group's line says the chosen period.
 */
export const InFilterMenu = meta.story({
  render: function Render() {
    const [period, setPeriod] = useState<Period>({})
    return (
      <FilterMenu
        title="Filtrer les commandes"
        activeCount={period.from || period.to ? 1 : 0}
        onReset={() => setPeriod({})}
      >
        <FilterDateRange
          id="ordered"
          legend="Date de commande"
          from={period.from}
          to={period.to}
          onChange={setPeriod}
        />
      </FilterMenu>
    )
  },
})
