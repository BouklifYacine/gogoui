import preview from '#.storybook/preview'

import { Stack } from './stack.tsx'

const meta = preview.meta({
  title: 'Mise en page/Stack',
  component: Stack,
})

const box = 'rounded-lg bg-tray px-4 py-3 text-sm text-fg-muted'

/**
 * Change its direction, gap and alignment in the controls.
 */
export const Basic = meta.story({
  args: {
    direction: 'row',
    gap: 4,
    align: 'center',
    children: (
      <>
        <div className={box}>Demande</div>
        <div className={box}>Visite</div>
        <div className={box}>Devis</div>
      </>
    ),
  },
})
