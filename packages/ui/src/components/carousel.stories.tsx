import preview from '#.storybook/preview'

import { AspectRatio } from './aspect-ratio.tsx'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel.tsx'

const meta = preview.meta({
  title: 'Affichage/Carousel',
  component: Carousel,
  subcomponents: {
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
  },
})

const rooms = [
  'La grange',
  'Le jardin',
  'L’orangerie',
  'La terrasse',
  'Le salon',
]

/**
 * A venue's rooms, one at a time: swipe, click the arrows, or use the
 * arrow keys once inside.
 */
export const Basic = meta.story({
  args: { orientation: 'horizontal', label: 'Les espaces du domaine' },
  render: (args) => (
    <Carousel {...args} className="w-80">
      <CarouselContent>
        {rooms.map((room) => (
          <CarouselItem key={room}>
            <AspectRatio ratio={4 / 3} className="rounded-2xl">
              <div className="flex items-center justify-center bg-tray text-sm font-medium text-fg-muted">
                {room}
              </div>
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
})

/**
 * Three slides at a time, looping.
 */
export const Several = meta.story({
  render: () => (
    <Carousel opts={{ loop: true, align: 'start' }} className="w-[36rem]">
      <CarouselContent>
        {rooms.map((room) => (
          <CarouselItem key={room} className="basis-1/3">
            <div className="flex h-32 items-center justify-center rounded-2xl bg-tray text-sm text-fg-muted">
              {room}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
})
