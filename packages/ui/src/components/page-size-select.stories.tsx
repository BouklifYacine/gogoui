import { useState } from 'react'

import preview from '#.storybook/preview'

import { PageSizeSelect } from './page-size-select.tsx'

const meta = preview.meta({
  title: 'Listes et tableaux/PageSizeSelect',
  component: PageSizeSelect,
})

/**
 * How many rows a page shows.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState(10)
    return <PageSizeSelect value={value} onValueChange={setValue} />
  },
})
