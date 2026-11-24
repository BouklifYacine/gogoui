import preview from '#.storybook/preview'

import { InfoTip } from './info-tip.tsx'

const meta = preview.meta({
  title: 'Fenêtres/InfoTip',
  component: InfoTip,
})

/**
 * Beside a section title, a sentence that helps without crowding the
 * page.
 */
export const Basic = meta.story({
  args: { text: 'La somme versée à la signature, déduite du solde.' },
  render: (args) => (
    <h2 className="flex items-center gap-1 text-base font-semibold text-fg">
      Acompte
      <InfoTip {...args} />
    </h2>
  ),
})
