import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { GoGoUIProvider } from '../i18n/gogoui-provider.tsx'

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

/**
 * With reduced motion (here `motion="off"`), the arrows jump to the slide.
 * Each slide is a « diapositive » named « 1 sur 5 »; at the last one,
 * « Diapositive suivante » turns off and keeps the focus.
 */
export const ReducedMotion = meta.story({
  render: () => (
    <GoGoUIProvider motion="off">
      <Carousel label="Les espaces du domaine" className="w-80">
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
    </GoGoUIProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('group', { name: '1 sur 5' })
    await expect(first).toHaveAttribute('aria-roledescription', 'diapositive')
    const next = canvas.getByRole('button', { name: 'Diapositive suivante' })
    for (let step = 1; step < rooms.length; step += 1) {
      await userEvent.click(next)
    }
    await waitFor(() => expect(next).toHaveAttribute('aria-disabled', 'true'))
    await expect(next).toHaveFocus()
  },
})
