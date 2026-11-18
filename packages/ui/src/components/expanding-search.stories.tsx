import { useState } from 'react'

import preview from '#.storybook/preview'

import { ExpandingSearch } from './expanding-search.tsx'

const meta = preview.meta({
  title: 'Listes/ExpandingSearch',
  component: ExpandingSearch,
})

/**
 * Click the pill, or press « / » anywhere: it opens into a field. Escape
 * folds it back.
 *
 * @summary A search that opens on a click or « / ».
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
