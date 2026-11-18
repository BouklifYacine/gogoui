import { useState } from 'react'
import { ListBulletsIcon, SquaresFourIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

const meta = preview.meta({
  title: 'Composants/ToggleGroup',
  component: ToggleGroup,
  subcomponents: { ToggleGroupItem },
})

/**
 * A calendar's view: one pressed among three.
 *
 * @summary One choice among a few.
 */
export const Basic = meta.story({
  render: function Render() {
    const [view, setView] = useState(['week'])
    return (
      <ToggleGroup
        aria-label="Vue du calendrier"
        value={view}
        onValueChange={(next) => {
          if (next.length > 0) setView(next as string[])
        }}
      >
        <ToggleGroupItem value="day">Jour</ToggleGroupItem>
        <ToggleGroupItem value="week">Semaine</ToggleGroupItem>
        <ToggleGroupItem value="month">Mois</ToggleGroupItem>
      </ToggleGroup>
    )
  },
})

/**
 * Icons alone, each named for a screen reader.
 *
 * @summary A list or grid switch.
 */
export const Icons = meta.story({
  render: () => (
    <ToggleGroup aria-label="Affichage" defaultValue={['list']}>
      <ToggleGroupItem value="list" aria-label="Liste">
        <ListBulletsIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grille">
        <SquaresFourIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
})
