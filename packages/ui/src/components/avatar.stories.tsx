import preview from '#.storybook/preview'

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from './avatar.tsx'

const meta = preview.meta({
  title: 'Composants/Avatar',
  component: Avatar,
})

/**
 * A person without a picture: their initials, on a quiet tint.
 *
 * @summary Initials when there is no picture.
 */
export const Basic = meta.story({
  render: () => (
    <Avatar>
      <AvatarFallback>LH</AvatarFallback>
    </Avatar>
  ),
})

/**
 * Several people on the same item: the first ones stacked, then how many
 * more.
 *
 * @summary A stack of people with a « +n ».
 */
export const Group = meta.story({
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>LH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>CM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
})
