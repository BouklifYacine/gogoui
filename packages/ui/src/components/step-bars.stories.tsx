import preview from '#.storybook/preview'

import { StepBars } from './step-bars.tsx'

const meta = preview.meta({
  title: 'Navigation/StepBars',
  component: StepBars,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * The second of three steps, at the top of a dialog.
 */
export const Basic = meta.story({
  args: { steps: ['Choisir', 'Connecter', 'Terminer'], current: 1 },
})
