import preview from '#.storybook/preview'

import { Progress, ProgressLabel, ProgressValue } from './progress.tsx'

const meta = preview.meta({
  title: 'Retours/Progress',
  component: Progress,
  args: { value: 60, color: 'primary' },
})

/**
 * How far a set-up has gone, named and written in figures.
 */
export const Basic = meta.story({
  render: (args) => (
    <Progress {...args} className="w-72">
      <ProgressLabel>Configuration du lieu</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
})
