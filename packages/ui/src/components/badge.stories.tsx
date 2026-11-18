import preview from '#.storybook/preview'

import { Badge } from './badge.tsx'

const meta = preview.meta({
  title: 'Composants/Badge',
  component: Badge,
  args: { children: '3' },
})

/**
 * A count next to a title or a tab: « Demandes 3 ».
 *
 * @summary A count in a pill.
 */
export const Basic = meta.story({})

/**
 * A neutral tag or a short state, quieter than the solid pill.
 *
 * @summary A quiet tag.
 */
export const Secondary = meta.story({
  args: { variant: 'secondary', children: 'Brouillon' },
})

/**
 * Something wrong, written in words (« En retard »): the red alone would
 * say nothing to someone who does not see it.
 *
 * @summary A problem state, always in words.
 */
export const Destructive = meta.story({
  args: { variant: 'destructive', children: 'En retard' },
})

/**
 * A tag drawn only by its edge, for a list of many tags side by side.
 *
 * @summary An outlined tag.
 */
export const Outline = meta.story({
  args: { variant: 'outline', children: 'Mariage' },
})

/**
 * A badge that leads somewhere: rendered as a link, it darkens when
 * pointed at.
 *
 * @summary A badge that is a link.
 */
export const AsLink = meta.story({
  args: { render: <a href="#impayes" />, children: '2 impayés' },
})
