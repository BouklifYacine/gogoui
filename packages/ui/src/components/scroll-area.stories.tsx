import preview from '#.storybook/preview'

import { ScrollArea } from './scroll-area.tsx'
import { Separator } from './separator.tsx'

const meta = preview.meta({
  title: 'Mise en page/ScrollArea',
  component: ScrollArea,
})

const days = Array.from({ length: 30 }, (_, index) => `${index + 1} juin 2027`)

/**
 * A long list in a box of a fixed height.
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

const rooms = [
  'Orangerie',
  'Grange',
  'Salon bleu',
  'Chapelle',
  'Terrasse',
  'Cave voûtée',
  'Jardin d’hiver',
  'Bibliothèque',
]

/**
 * Scroll, or point at the box: the bar shows at once and leaves slowly; it
 * thickens under the pointer. Each edge fades while there is more past it,
 * by as much as is left. The row of cards scrolls sideways with the wheel.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <div className="flex flex-col gap-6">
      <ScrollArea
        aria-label="Dates libres"
        className="h-72 w-56 rounded-lg border border-line"
      >
        <div className="p-4">
          {days.map((day) => (
            <div key={day}>
              <p className="py-2 text-sm text-fg-muted">{day}</p>
              <Separator />
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea aria-label="Espaces" className="w-96">
        <div className="flex gap-3 p-1 pb-4">
          {rooms.map((room) => (
            <div
              key={room}
              className="flex h-24 w-36 shrink-0 items-end rounded-xl bg-subtle p-3 text-sm font-medium text-fg"
            >
              {room}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
})

/** `fade={0}`: hard edges, for a list whose rows must stay readable to the last pixel. */
export const WithoutFade = meta.story({
  render: () => (
    <ScrollArea fade={0} className="h-72 w-56 rounded-lg border border-line">
      <div className="p-4">
        {days.map((day) => (
          <p key={day} className="py-2 text-sm text-fg-muted">
            {day}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
})
