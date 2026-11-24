import preview from '#.storybook/preview'

import { PageHeaderSkeleton } from './page-header-skeleton.tsx'
import { SkeletonButton } from './skeleton.tsx'

const meta = preview.meta({
  title: 'Mise en page/PageHeaderSkeleton',
  component: PageHeaderSkeleton,
  parameters: { layout: 'padded' },
})

/**
 * A page's header while it loads, at the size of the real one: the real
 * title and sentence give the grey bars their length, so nothing jumps
 * when the page arrives.
 */
export const Basic = meta.story({
  args: {
    title: 'Projets',
    description:
      'Tous les projets de votre équipe, du brouillon à la livraison.',
    actions: <SkeletonButton>Nouveau projet</SkeletonButton>,
  },
})

/**
 * Without a sentence or buttons: the title alone.
 */
export const TitleOnly = meta.story({
  args: { title: 'Paramètres' },
})
