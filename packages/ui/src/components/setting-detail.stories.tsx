import preview from '#.storybook/preview'

import { SettingDetail } from './setting-detail.tsx'

const meta = preview.meta({
  title: 'Réglages/SettingDetail',
  component: SettingDetail,
  args: { onEdit: () => {} },
})

/**
 * A switched setting's details and their « Modifier », under a
 * `SettingSwitchRow` that is on. `editLabel` completes the button's name
 * for a screen reader: « Modifier le délai du rappel ».
 */
export const Basic = meta.story({
  args: {
    children: '2 jours avant',
    editLabel: 'le délai du rappel',
  },
})
