import preview from '#.storybook/preview'

import { DetailsList } from './details-list.tsx'

const meta = preview.meta({
  title: 'Mise en page/DetailsList',
  component: DetailsList,
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * Labels and values side by side; one under the other in a narrow block.
 *
 * @summary A record's details.
 */
export const Basic = meta.story({
  args: {
    rows: [
      ['Date souhaitée', 'samedi 12 juin 2027'],
      ['Invités', '120'],
      ['Budget', '18 000 €'],
      ['E-mail', 'marie.durand@exemple.fr'],
    ],
  },
})
