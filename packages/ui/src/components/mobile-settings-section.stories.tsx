import preview from '#.storybook/preview'

import { MobileSettingsSection } from './mobile-settings-section.tsx'
import { TextField } from './text-field.tsx'

const meta = preview.meta({
  title: 'Réglages/MobileSettingsSection',
  component: MobileSettingsSection,
  decorators: [(Story) => <div className="w-full max-w-md">{Story()}</div>],
})

const fields = (
  <>
    <TextField name="company" label="Société" defaultValue="Atelier Nord" />
    <TextField name="city" label="Ville" defaultValue="Lille" />
  </>
)

/**
 * On a phone, a part of a long settings form folds into a card; its line
 * says what is set. A tap opens it.
 */
export const OnPhone = meta.story({
  globals: { viewport: { value: 'phone' } },
  args: {
    title: 'Coordonnées',
    summary: 'Atelier Nord, Lille',
    children: fields,
  },
})

/**
 * Open from the start (`defaultOpen`), for the part a visitor came for.
 */
export const OpenOnPhone = meta.story({
  globals: { viewport: { value: 'phone' } },
  args: {
    title: 'Coordonnées',
    summary: 'Atelier Nord, Lille',
    defaultOpen: true,
    children: fields,
  },
})

/**
 * From 768 px it is always open: the fields alone, without the card.
 */
export const OnComputer = meta.story({
  args: {
    title: 'Coordonnées',
    summary: 'Atelier Nord, Lille',
    children: fields,
  },
})
