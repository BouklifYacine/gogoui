import preview from '#.storybook/preview'

import { Progress, ProgressLabel, ProgressValue } from './progress.tsx'

const meta = preview.meta({
  title: 'Composants/Progress',
  component: Progress,
})

/**
 * How far a set-up has gone, named and written in figures.
 *
 * @summary A labelled progress bar with its value.
 */
export const Basic = meta.story({
  render: () => (
    <Progress value={60} className="w-72">
      <ProgressLabel>Configuration du lieu</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
})
