import { useState } from 'react'

import preview from '#.storybook/preview'

import { FilterChips } from './filter-chips.tsx'

const meta = preview.meta({
  title: 'Filtres et recherche/FilterChips',
  component: FilterChips,
})

/**
 * The filters that are on; each chip takes its own off.
 */
export const Basic = meta.story({
  render: function Render() {
    const all = [
      { id: 'stage', label: 'Étape : Nouvelle' },
      { id: 'month', label: 'Mois : juin 2027' },
      { id: 'source', label: 'Source : Instagram' },
    ]
    const [on, setOn] = useState(all.map((chip) => chip.id))
    return (
      <FilterChips
        chips={all
          .filter((chip) => on.includes(chip.id))
          .map((chip) => ({
            ...chip,
            onRemove: () => setOn((ids) => ids.filter((id) => id !== chip.id)),
          }))}
        onReset={() => setOn([])}
      />
    )
  },
})
