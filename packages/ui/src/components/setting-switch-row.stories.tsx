import { useState } from 'react'

import preview from '#.storybook/preview'

import { SettingDetail } from './setting-detail.tsx'
import { SettingSwitchRow } from './setting-switch-row.tsx'
import { SettingsList } from './settings-list.tsx'

const meta = preview.meta({
  title: 'Réglages/SettingSwitchRow',
  component: SettingSwitchRow,
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <SettingsList>{Story()}</SettingsList>
      </div>
    ),
  ],
})

/**
 * A setting that applies as soon as it is switched; the sentence under the
 * title describes the switch.
 */
export const Basic = meta.story({
  render: function Render() {
    const [checked, setChecked] = useState(true)
    return (
      <SettingSwitchRow
        id="weekly-summary"
        title="Résumé de la semaine"
        description="Un e-mail chaque lundi avec ce qui a changé."
        checked={checked}
        onCheckedChange={setChecked}
      />
    )
  },
})

/**
 * On, with its details and their « Modifier » (`SettingDetail`) under the
 * sentence.
 */
export const WithDetails = meta.story({
  render: function Render() {
    const [checked, setChecked] = useState(true)
    return (
      <SettingSwitchRow
        id="reminders"
        title="Rappels"
        description="Un rappel avant chaque échéance."
        checked={checked}
        onCheckedChange={setChecked}
      >
        {checked && (
          <SettingDetail editLabel="le délai du rappel" onEdit={() => {}}>
            2 jours avant
          </SettingDetail>
        )}
      </SettingSwitchRow>
    )
  },
})

/**
 * While the change is saved, the switch waits (`saving`).
 */
export const Saving = meta.story({
  args: {
    id: 'saving',
    title: 'Partage public',
    description: 'Toute personne avec le lien peut voir la page.',
    checked: true,
    saving: true,
    onCheckedChange: () => {},
  },
})

/**
 * A refused change: the reason under the row, the switch back where it
 * was.
 */
export const Refused = meta.story({
  args: {
    id: 'refused',
    title: 'Partage public',
    description: 'Toute personne avec le lien peut voir la page.',
    checked: false,
    error: 'Le partage est fermé par votre administrateur.',
    onCheckedChange: () => {},
  },
})
