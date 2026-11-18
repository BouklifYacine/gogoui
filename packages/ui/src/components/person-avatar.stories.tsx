import preview from '#.storybook/preview'

import { PersonAvatar } from './person-avatar.tsx'

const meta = preview.meta({
  title: 'Composants/PersonAvatar',
  component: PersonAvatar,
})

/**
 * No photo: the initials of the name.
 *
 * @summary A person's initials.
 */
export const Initials = meta.story({
  args: { name: 'Marie Durand' },
})

/**
 * The three sizes, for a dense list, a row and a header.
 *
 * @summary The three sizes.
 */
export const Sizes = meta.story({
  render: () => (
    <div className="flex items-center gap-3">
      <PersonAvatar name="Marie Durand" size="sm" />
      <PersonAvatar name="Marie Durand" />
      <PersonAvatar name="Marie Durand" size="lg" />
    </div>
  ),
})

/**
 * A photo that fails to load: the initials take its place.
 *
 * @summary A broken photo falls back to the initials.
 */
export const BrokenPhoto = meta.story({
  args: { name: 'Lucas Martin', src: 'https://example.invalid/photo.jpg' },
})
