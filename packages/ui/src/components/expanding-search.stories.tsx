import { useState } from 'react'

import preview from '#.storybook/preview'

import { ExpandingSearch } from './expanding-search.tsx'

const meta = preview.meta({
  title: 'Filtres et recherche/ExpandingSearch',
  component: ExpandingSearch,
})

/**
 * Click the pill, or press « / » anywhere: it opens into a field. Escape
 * folds it back.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('')
    return (
      <ExpandingSearch
        id="search-clients"
        label="Rechercher un client"
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
