import { useState } from 'react'
import { ListBulletsIcon, SquaresFourIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { COLORS } from '../internal/colors.ts'

import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

const meta = preview.meta({
  title: 'Composants/ToggleGroup',
  component: ToggleGroup,
  subcomponents: { ToggleGroupItem },
})

/**
 * A calendar's view: one pressed among three.
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
 * The pressed item in each colour of the palette (`color` on the item).
 */
export const Colors = meta.story({
  render: () => (
    <div className="flex flex-col gap-2">
      {COLORS.map((color) => (
        <ToggleGroup key={color} aria-label={color} defaultValue={['b']}>
          <ToggleGroupItem value="a" color={color}>
            Jour
          </ToggleGroupItem>
          <ToggleGroupItem value="b" color={color}>
            {color}
          </ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  ),
})

/**
 * Icons alone, each named for a screen reader.
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
