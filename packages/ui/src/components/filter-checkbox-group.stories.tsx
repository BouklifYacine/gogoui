import { useState } from 'react'
import { FlagIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { FilterCheckboxGroup } from './filter-checkbox-group.tsx'
import { FilterMenu } from './filter-menu.tsx'

const statuses = [
  { value: 'todo', label: 'À faire' },
  { value: 'doing', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
] as const

type Status = (typeof statuses)[number]['value']

const meta = preview.meta({
  title: 'Filtres et recherche/FilterCheckboxGroup',
  component: FilterCheckboxGroup,
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
})

/**
 * A status where one value at a time is enough: ticking a box unticks the
 * other; ticking it again clears the filter.
 */
export const Basic = meta.story({
  render: function Render() {
    const [status, setStatus] = useState<Status | undefined>('doing')
    return (
      <FilterCheckboxGroup
        legend="Statut"
        icon={FlagIcon}
        options={statuses}
        checked={status}
        onCheckedChange={setStatus}
      />
    )
  },
})

/**
 * In a `FilterMenu`: alone, the group opens straight away; among others,
 * its line says the chosen value.
 */
export const InFilterMenu = meta.story({
  render: function Render() {
    const [status, setStatus] = useState<Status | undefined>(undefined)
    return (
      <FilterMenu
        title="Filtrer les tâches"
        activeCount={status ? 1 : 0}
        onReset={() => setStatus(undefined)}
      >
        <FilterCheckboxGroup
          legend="Statut"
          icon={FlagIcon}
          options={statuses}
          checked={status}
          onCheckedChange={setStatus}
        />
      </FilterMenu>
    )
  },
})
