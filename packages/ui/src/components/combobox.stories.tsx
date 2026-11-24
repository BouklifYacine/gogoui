import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
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
  title: 'Formulaires/Saisie/Combobox',
  component: Combobox,
  subcomponents: {
    ComboboxInput,
    ComboboxTrigger,
    ComboboxValue,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxCollection,
    ComboboxEmpty,
    ComboboxSeparator,
    ComboboxChips,
    ComboboxChip,
    ComboboxChipsInput,
  },
})

/**
 * A long list filtered as you type; a message when nothing matches.
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
  // Typing filters the list; Escape closes it and the focus stays in the
  // field.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const input = within(canvasElement).getByRole('combobox', { name: 'Ville' })
    await userEvent.type(input, 'Ly')
    const list = await page.findByRole('listbox')
    // The rows fade in one after another: wait for them.
    await waitFor(() =>
      expect(within(list).getByRole('option', { name: 'Lyon' })).toBeVisible(),
    )
    await expect(
      within(list).queryByRole('option', { name: 'Paris' }),
    ).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('listbox')).not.toBeInTheDocument(),
    )
    await expect(input).toHaveFocus()
  },
})

/**
 * Several choices, each a chip in the field (`multiple`): type to narrow
 * the list, Backspace removes the last chip.
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

/**
 * The list's height follows the filter on a spring, the highlight glides,
 * a picked city settles into the field, the × pops in and clearing fades
 * the placeholder back; « no result » rises as it appears.
 */
export const Animations = meta.story({
  tags: ['animated'],
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
