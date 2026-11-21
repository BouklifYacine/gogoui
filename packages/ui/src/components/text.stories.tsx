import preview from '#.storybook/preview'

import { Text } from './text.tsx'

const meta = preview.meta({
  title: 'Mise en page/Text',
  component: Text,
})

/**
 * Body text: its size, tone, weight and colour in the controls.
 */
export const Basic = meta.story({
  args: {
    size: 'base',
    tone: 'default',
    weight: 'normal',
    numeric: false,
    children: 'Le couple a confirmé la visite de samedi.',
  },
})
