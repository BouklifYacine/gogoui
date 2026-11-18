import preview from '#.storybook/preview'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
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

/**
 * Several choices, each a chip in the field (`multiple`): type to narrow
 * the list, Backspace removes the last chip.
 *
 * @summary Pick several choices, shown as chips.
 */
export const Multiple = meta.story({
  render: function Render() {
    const anchor = useComboboxAnchor()
    return (
      <Combobox
        multiple
        autoHighlight
        items={cities}
        defaultValue={['Lyon', 'Annecy']}
      >
        <ComboboxChips ref={anchor} className="w-80">
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((city) => (
                  <ComboboxChip key={city}>{city}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  aria-label="Villes"
                  placeholder="Ajouter une ville"
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
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
    )
  },
})
