import preview from '#.storybook/preview'

import { AspectRatio } from './aspect-ratio.tsx'

const meta = preview.meta({
  title: 'Mise en page/AspectRatio',
  component: AspectRatio,
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
})

/**
 * A picture kept at 16:9 whatever its width; change the ratio in the
 * controls.
 */
export const Basic = meta.story({
  args: {
    ratio: 16 / 9,
    className: 'rounded-2xl',
    children: (
      <div className="flex items-center justify-center bg-gradient-to-br from-info-subtle to-success-subtle text-sm text-fg-muted">
        16:9
      </div>
    ),
  },
})
