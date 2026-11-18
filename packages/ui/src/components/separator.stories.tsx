import preview from '#.storybook/preview'

import { Separator } from './separator.tsx'

const meta = preview.meta({
  title: 'Composants/Separator',
  component: Separator,
})

/**
 * A hairline between two zones of a card.
 *
 * @summary A horizontal hairline.
 */
export const Basic = meta.story({
  args: { orientation: 'horizontal' },
  render: (args) => (
    <div className="w-72 text-sm">
      <p>Acompte : 1 500 €</p>
      <Separator {...args} className="my-3" />
      <p>Solde : 3 500 €</p>
    </div>
  ),
})

/**
 * A thin vertical line between items of a row.
 *
 * @summary A vertical hairline in a row.
 */
export const Vertical = meta.story({
  render: () => (
    <div className="flex h-5 items-center gap-3 text-sm">
      <span>Jour</span>
      <Separator orientation="vertical" />
      <span>Semaine</span>
      <Separator orientation="vertical" />
      <span>Mois</span>
    </div>
  ),
})
