import preview from '#.storybook/preview'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select.tsx'

const eventTypes = [
  { value: 'wedding', label: 'Mariage' },
  { value: 'seminar', label: 'Séminaire' },
  { value: 'birthday', label: 'Anniversaire' },
  { value: 'baptism', label: 'Baptême' },
  { value: 'reception', label: 'Réception' },
  { value: 'other', label: 'Autre' },
]

const meta = preview.meta({
  title: 'Composants/Select',
  component: Select,
})

/**
 * One choice in a list of six or more, under its label. `items` gives the
 * trigger the label of the chosen value instead of its code.
 *
 * @summary Pick one value in a labelled list.
 */
export const Basic = meta.story({
  render: () => (
    <div className="grid w-64 gap-2">
      <span id="event-type-label" className="text-sm font-medium">
        Type d'événement
      </span>
      <Select items={eventTypes}>
        <SelectTrigger aria-labelledby="event-type-label" className="w-full">
          <SelectValue placeholder="Choisir" />
        </SelectTrigger>
        <SelectContent>
          {eventTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
})

/**
 * A long list cut in groups, each with its title.
 *
 * @summary Items in titled groups.
 */
export const Grouped = meta.story({
  render: () => (
    <Select defaultValue="orangerie">
      <SelectTrigger aria-label="Salle" className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Intérieur</SelectLabel>
          <SelectItem value="orangerie">Orangerie</SelectItem>
          <SelectItem value="grange">Grange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Extérieur</SelectLabel>
          <SelectItem value="parc">Parc</SelectItem>
          <SelectItem value="terrasse">Terrasse</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
})

/**
 * The small trigger of a toolbar (a sort, a page size): 32px at a desk,
 * still 44px under a thumb.
 *
 * @summary A compact select for a toolbar.
 */
export const Small = meta.story({
  render: () => (
    <Select defaultValue="20">
      <SelectTrigger size="sm" aria-label="Lignes par page">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="20">20 lignes</SelectItem>
        <SelectItem value="50">50 lignes</SelectItem>
        <SelectItem value="100">100 lignes</SelectItem>
      </SelectContent>
    </Select>
  ),
})
