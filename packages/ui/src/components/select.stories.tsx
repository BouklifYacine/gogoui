import preview from '#.storybook/preview'

import {
  Select,
  SelectChips,
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

/**
 * Several values (`multiple` + `SelectChips`): the list stays open while
 * you pick, two chips show, the rest fold into « +N ».
 */
export const Multiple = meta.story({
  render: () => (
    <Select multiple items={eventTypes} defaultValue={['wedding', 'seminar']}>
      <SelectTrigger aria-label="Types d'événement" className="w-72">
        <SelectChips placeholder="Choisir" maxVisible={2} />
      </SelectTrigger>
      <SelectContent>
        {eventTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
})

/**
 * `variant="morph"`: the button itself grows into the list, and folds
 * back into it; the picked label flies up into place.
 */
export const Morph = meta.story({
  tags: ['animated'],
  render: () => (
    <Select items={eventTypes} defaultValue="wedding">
      <SelectTrigger aria-label="Type d'événement" className="w-44">
        <SelectValue placeholder="Choisir" />
      </SelectTrigger>
      <SelectContent variant="morph">
        {eventTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
})

/**
 * The list opens like the menus, its rows following one after another; the
 * highlight glides from row to row; the chosen value rolls in the trigger
 * the way the list runs; the tick draws itself; the chevron turns over.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <Select items={eventTypes} defaultValue="birthday">
      <SelectTrigger aria-label="Type d'événement" className="w-56">
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
  ),
})
