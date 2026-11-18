import preview from '#.storybook/preview'

import { CopyLinkField } from './copy-link-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/CopyLinkField',
  component: CopyLinkField,
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * A public link to share, with where to paste it.
 *
 * @summary A link to copy.
 */
export const Basic = meta.story({
  args: {
    id: 'public-link',
    label: 'Lien de votre page',
    value: 'https://example.com/r/domaine-des-chenes',
    description: 'À mettre dans votre bio Instagram et votre signature.',
  },
})
