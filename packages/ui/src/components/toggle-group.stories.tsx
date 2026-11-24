import { useState } from 'react'
import { ListBulletsIcon, SquaresFourIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { COLORS } from '../internal/colors.ts'

import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

const meta = preview.meta({
  title: 'Actions/ToggleGroup',
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

const stages = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'visit', label: 'Visite' },
  { value: 'quote', label: 'Devis envoyé' },
  { value: 'option', label: 'Option posée' },
  { value: 'won', label: 'Gagnée' },
  { value: 'lost', label: 'Perdue' },
  { value: 'archived', label: 'Archivée' },
  { value: 'spam', label: 'Indésirable' },
]

/**
 * `variant="chips"`: the stages a list keeps, several at once; a pressed
 * chip carries a tick, never its colour alone.
 */
export const Chips = meta.story({
  render: function Render() {
    const [kept, setKept] = useState(['visit', 'quote'])
    return (
      <ToggleGroup
        variant="chips"
        multiple
        aria-label="Étapes"
        value={kept}
        onValueChange={setKept}
        className="max-w-md"
      >
        {stages.slice(0, 6).map((stage) => (
          <ToggleGroupItem key={stage.value} value={stage.value}>
            {stage.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    )
  },
})

/**
 * Past `maxVisible` the rest fold behind « +N de plus »; pressed chips
 * stay in view when it folds back.
 */
export const ChipsFolded = meta.story({
  render: () => (
    <ToggleGroup
      variant="chips"
      multiple
      maxVisible={4}
      aria-label="Étapes"
      defaultValue={['won']}
      className="max-w-md"
    >
      {stages.map((stage) => (
        <ToggleGroupItem key={stage.value} value={stage.value} color="primary">
          {stage.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  ),
})

/**
 * The tick pushes the words aside as it draws itself and the fill's edge
 * follows; the other chips glide, even to another line; « +N de plus »
 * opens the height and the revealed chips arrive one after another.
 */
export const ChipsAnimations = meta.story({
  tags: ['animated'],
  render: () => (
    <ToggleGroup
      variant="chips"
      multiple
      maxVisible={5}
      aria-label="Étapes"
      className="max-w-sm"
    >
      {stages.map((stage) => (
        <ToggleGroupItem key={stage.value} value={stage.value}>
          {stage.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  ),
})
