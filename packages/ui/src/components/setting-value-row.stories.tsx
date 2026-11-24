import preview from '#.storybook/preview'

import { SettingValueRow } from './setting-value-row.tsx'
import { SettingsList } from './settings-list.tsx'

const meta = preview.meta({
  title: 'Réglages/SettingValueRow',
  component: SettingValueRow,
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <SettingsList>{Story()}</SettingsList>
      </div>
    ),
  ],
  args: { onEdit: () => {} },
})

/**
 * What is set today, in words, and the button that opens its dialog
 * (`SettingDialog`).
 */
export const Basic = meta.story({
  args: {
    title: 'Adresse de facturation',
    description: 'Sur chaque facture.',
    value: '12 rue des Lilas\n75011 Paris',
  },
})

/**
 * Nothing set yet: the value says so, the button says « Choisir »
 * (`editLabel`).
 */
export const Empty = meta.story({
  args: {
    title: 'Fuseau horaire',
    value: 'Aucun',
    editLabel: 'Choisir',
  },
})
