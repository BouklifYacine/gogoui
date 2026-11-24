import { useState } from 'react'
import { BellIcon, FlagIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { FilterCheckbox } from './filter-checkbox.tsx'
import { FilterCheckboxGroup } from './filter-checkbox-group.tsx'
import { FilterMenu } from './filter-menu.tsx'
import { FilterSection } from './filter-section.tsx'

const meta = preview.meta({
  title: 'Filtres et recherche/FilterSection',
  component: FilterSection,
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
})

/**
 * Several filters under one legend; `summary` says what is on when the
 * group is folded into its line.
 */
export const Basic = meta.story({
  render: function Render() {
    const [unread, setUnread] = useState(true)
    const [starred, setStarred] = useState(false)
    return (
      <FilterSection
        legend="Suivi"
        icon={BellIcon}
        summary={unread ? 'Non lus' : null}
      >
        <FilterCheckbox
          label="Non lus seulement"
          checked={unread}
          onCheckedChange={setUnread}
        />
        <FilterCheckbox
          label="Favoris"
          checked={starred}
          onCheckedChange={setStarred}
        />
      </FilterSection>
    )
  },
})

/**
 * Two groups in a `FilterMenu`: each one a line with its icon and its
 * summary, opened one at a time.
 */
export const InFilterMenu = meta.story({
  render: function Render() {
    const [priority, setPriority] = useState<'high' | 'low' | undefined>()
    const [unread, setUnread] = useState(false)
    return (
      <FilterMenu
        title="Filtrer les messages"
        activeCount={Number(priority !== undefined) + Number(unread)}
        onReset={() => {
          setPriority(undefined)
          setUnread(false)
        }}
      >
        <FilterCheckboxGroup
          legend="Priorité"
          icon={FlagIcon}
          options={[
            { value: 'high', label: 'Haute' },
            { value: 'low', label: 'Basse' },
          ]}
          checked={priority}
          onCheckedChange={setPriority}
        />
        <FilterSection
          legend="Suivi"
          icon={BellIcon}
          summary={unread ? 'Non lus' : null}
        >
          <FilterCheckbox
            label="Non lus seulement"
            checked={unread}
            onCheckedChange={setUnread}
          />
        </FilterSection>
      </FilterMenu>
    )
  },
})
