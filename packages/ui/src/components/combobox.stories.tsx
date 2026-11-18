import preview from '#.storybook/preview'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox.tsx'

const cities = [
  'Annecy',
  'Bordeaux',
  'Dijon',
  'Lille',
  'Lyon',
  'Marseille',
  'Montpellier',
  'Nantes',
  'Nice',
  'Paris',
  'Rennes',
  'Strasbourg',
  'Toulouse',
]

const meta = preview.meta({
  title: 'Composants/Combobox',
  component: Combobox,
})

/**
 * A long list filtered as you type; a message when nothing matches.
 *
 * @summary Type to filter, then pick.
 */
export const Basic = meta.story({
  render: () => (
    <Combobox items={cities}>
      <ComboboxInput placeholder="Lyon" aria-label="Ville" showClear />
      <ComboboxContent>
        <ComboboxEmpty>Aucune ville trouvée.</ComboboxEmpty>
        <ComboboxList>
          {(city: string) => (
            <ComboboxItem key={city} value={city}>
              {city}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
})
