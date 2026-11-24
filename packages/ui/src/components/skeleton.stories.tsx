import preview from '#.storybook/preview'

import {
  Skeleton,
  SkeletonBadge,
  SkeletonButton,
  SkeletonText,
} from './skeleton.tsx'

const meta = preview.meta({
  title: 'Retours/Skeleton',
  component: Skeleton,
})

/**
 * A client card while it loads: picture, name, state and action in grey,
 * each the size of the real thing.
 */
export const Basic = meta.story({
  render: () => (
    <div className="flex w-80 items-center gap-3 rounded-xl bg-surface p-4 shadow-sm">
      <Skeleton className="size-10 rounded-full" />
      <div className="grid flex-1 gap-1 text-sm">
        <SkeletonText>Léa et Hugo Martin</SkeletonText>
        <SkeletonBadge>Nouvelle</SkeletonBadge>
      </div>
      <SkeletonButton size="sm">Ouvrir</SkeletonButton>
    </div>
  ),
})
