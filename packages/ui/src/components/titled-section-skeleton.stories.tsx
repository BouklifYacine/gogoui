import preview from '#.storybook/preview'

import { SkeletonBadge, SkeletonText } from './skeleton.tsx'
import { TitledSectionSkeleton } from './titled-section-skeleton.tsx'

const meta = preview.meta({
  title: 'Mise en page/TitledSectionSkeleton',
  component: TitledSectionSkeleton,
  decorators: [
    (Story) => <div className="w-[32rem] max-w-full">{Story()}</div>,
  ],
})

/**
 * A titled part of a page while it loads: its title as a grey bar, its
 * content's skeletons under it.
 */
export const Basic = meta.story({
  args: {
    title: 'Livraison',
    children: (
      <>
        <p>
          <SkeletonText>Adresse 12 rue des Lilas, Paris</SkeletonText>
        </p>
        <p>
          <SkeletonText>Créneau mardi de 9 h à 12 h</SkeletonText>
        </p>
      </>
    ),
  },
})

/**
 * Compact (a smaller title, less space), with a badge beside the title
 * (`aside`).
 */
export const CompactWithAside = meta.story({
  args: {
    title: 'Paiement',
    compact: true,
    aside: <SkeletonBadge>Payé</SkeletonBadge>,
    children: (
      <p>
        <SkeletonText>Carte se terminant par 4242</SkeletonText>
      </p>
    ),
  },
})
