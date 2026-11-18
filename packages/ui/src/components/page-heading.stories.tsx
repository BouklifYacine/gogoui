import preview from '#.storybook/preview'

import { PageHeading } from './page-heading.tsx'

const meta = preview.meta({
  title: 'Mise en page/PageHeading',
  component: PageHeading,
})

/**
 * A page's h1: it takes the focus when it appears, so a screen reader
 * reads the new page.
 *
 * @summary A page's title.
 */
export const Basic = meta.story({
  args: { children: 'Paramètres' },
})
