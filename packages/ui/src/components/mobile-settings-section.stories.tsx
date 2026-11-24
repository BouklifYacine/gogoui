import preview from '#.storybook/preview'

import { MobileSettingsSection } from './mobile-settings-section.tsx'
import { TextField } from './text-field.tsx'

const meta = preview.meta({
  title: 'Réglages/MobileSettingsSection',
  tags: ['deprecated'],
  component: MobileSettingsSection,
  decorators: [(Story) => <div className="w-full max-w-md">{Story()}</div>],
})

/**
 * `SettingsSection` under its old name: same props, same output. Folded
 * on a phone, always open from 48rem.
 */
export const OnPhone = meta.story({
  globals: { viewport: { value: 'phone' } },
  args: {
    title: 'Coordonnées',
    summary: 'Atelier Nord, Lille',
    children: (
      <>
        <TextField name="company" label="Société" defaultValue="Atelier Nord" />
        <TextField name="city" label="Ville" defaultValue="Lille" />
      </>
    ),
  },
})
