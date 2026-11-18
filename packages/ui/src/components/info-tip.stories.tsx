import preview from '#.storybook/preview'

import { InfoTip } from './info-tip.tsx'

const meta = preview.meta({
  title: 'Composants/InfoTip',
  component: InfoTip,
})

/**
 * Beside a section title, a sentence that helps without crowding the
 * page.
 *
 * @summary An explanation beside a title.
 */
export const Basic = meta.story({
  render: () => (
    <h2 className="flex items-center gap-1 text-base font-semibold text-fg">
      Acompte
      <InfoTip text="La somme versée à la signature, déduite du solde." />
    </h2>
  ),
})
