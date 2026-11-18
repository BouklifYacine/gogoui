import preview from '#.storybook/preview'

import { ScrollArea } from './scroll-area.tsx'
import { Separator } from './separator.tsx'

const meta = preview.meta({
  title: 'Composants/ScrollArea',
  component: ScrollArea,
})

const days = Array.from({ length: 30 }, (_, index) => `${index + 1} juin 2027`)

/**
 * A long list in a box of a fixed height.
 *
 * @summary A box that scrolls.
 */
export const Basic = meta.story({
  render: () => (
    <ScrollArea className="h-72 w-56 rounded-lg border border-line">
      <div className="p-4">
        <p className="mb-3 text-sm font-medium text-fg">Dates libres</p>
        {days.map((day) => (
          <div key={day}>
            <p className="py-2 text-sm text-fg-muted">{day}</p>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
})
