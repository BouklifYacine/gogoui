import preview from '#.storybook/preview'

import { SettingRowSkeleton } from './setting-row-skeleton.tsx'
import { SettingsList } from './settings-list.tsx'

const meta = preview.meta({
  title: 'Réglages/SettingRowSkeleton',
  component: SettingRowSkeleton,
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <SettingsList>{Story()}</SettingsList>
      </div>
    ),
  ],
})

/**
 * A switch row while it loads: the real title and sentence give the grey
 * bars their length, a pill stands for the switch.
 */
export const SwitchRow = meta.story({
  args: {
    title: 'Résumé de la semaine',
    description: 'Un e-mail chaque lundi avec ce qui a changé.',
  },
})

/**
 * A value row (`value`): the value under the title, « Modifier » beside.
 */
export const ValueRow = meta.story({
  args: {
    title: 'Adresse de facturation',
    description: 'Sur chaque facture.',
    value: '12 rue des Lilas, 75011 Paris',
  },
})
