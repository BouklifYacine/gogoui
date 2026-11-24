import { createContext, use, useCallback, useSyncExternalStore } from 'react'
import type { ComponentProps, KeyboardEvent } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { UseEmblaCarouselType } from 'embla-carousel-react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'

type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0]
type CarouselPlugins = Parameters<typeof useEmblaCarousel>[1]

type CarouselState = {
  viewport: UseEmblaCarouselType[0]
  api: CarouselApi
  vertical: boolean
  canPrevious: boolean
  canNext: boolean
}

const CarouselContext = createContext<CarouselState | null>(null)

function useCarousel(): CarouselState {
  const state = use(CarouselContext)
  if (!state) {
    throw new Error('A carousel part must sit inside a Carousel.')
  }
  return state
}

const idle = 'false|false|0|0'

/** The words Carousel writes, to change on one Carousel only. */
type CarouselLabels = Partial<Pick<GoGoUIMessages, 'slideOf'>>

type CarouselProps = ComponentProps<'section'> & {
  /** Embla's options: `loop`, `align`, `slidesToScroll`… */
  opts?: CarouselOptions
  plugins?: CarouselPlugins
  orientation?: 'horizontal' | 'vertical'
  /** What the slides show, for a screen reader (« Photos du domaine »). */
  label?: string
  /** Embla's API, to drive it from outside (a counter, thumbnails). */
  setApi?: (api: CarouselApi) => void
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: CarouselLabels
}

/**
 * Slides to swipe or step through (embla).
 *
 * **Use it for** photos of a venue, testimonials, a gallery. **Not for**
 * important information: half the people never see slide 3.
 *
 * **Where**: in a page section or a card, with room for the arrows.
 *
 * **States**: first slide (previous disabled), middle, last (next
 * disabled); looping with `opts.loop`.
 *
 * **Key props**: `opts` (loop, align, slidesToScroll), `orientation`,
 * `label` (what the slides show), `setApi` (to drive it from outside).
 * `basis-1/3` on `CarouselItem` shows three at once,
 * `labels` to change its words.
 *
 * **Compose**: `Carousel` > `CarouselContent` > `CarouselItem`s +
 * `CarouselPrevious` + `CarouselNext`.
 *
 * **Accessibility**: named region; arrow keys move; « 2 sur 5 » read aloud.
 *
 * @summary Slides to swipe or step through.
 */
function Carousel({
  opts,
  plugins,
  orientation = 'horizontal',
  label,
  setApi,
  className,
  children,
  labels,
  ...props
}: CarouselProps) {
  const messages = useGoGoUIMessages(labels)
  const vertical = orientation === 'vertical'
  const [viewport, api] = useEmblaCarousel(
    { ...opts, axis: vertical ? 'y' : 'x' },
    plugins,
  )

  // Embla tells when the slide changes; React reads it without an effect.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!api) return () => {}
      setApi?.(api)
      api.on('select', onChange).on('reInit', onChange)
      return () => {
        api.off('select', onChange)
        api.off('reInit', onChange)
      }
    },
    [api, setApi],
  )
  const snapshot = useSyncExternalStore(
    subscribe,
    () =>
      api
        ? `${String(api.canScrollPrev())}|${String(api.canScrollNext())}|${String(api.selectedScrollSnap())}|${String(api.scrollSnapList().length)}`
        : idle,
    () => idle,
  )
  const [previous, next, index, total] = snapshot.split('|')
  const state: CarouselState = {
    viewport,
    api,
    vertical,
    canPrevious: previous === 'true',
    canNext: next === 'true',
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) {
      event.preventDefault()
      api?.scrollPrev()
    } else if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) {
      event.preventDefault()
      api?.scrollNext()
    }
  }

  return (
    <CarouselContext value={state}>
      <section
        aria-roledescription="carousel"
        aria-label={label ?? messages.carousel}
        data-slot="carousel"
        onKeyDownCapture={onKeyDown}
        className={cn('relative', className)}
        {...props}
      >
        {children}
        <p aria-live="polite" className="sr-only">
          {Number(total) > 0
            ? messages.slideOf(Number(index) + 1, Number(total))
            : ''}
        </p>
      </section>
    </CarouselContext>
  )
}

function CarouselContent({ className, ...props }: ComponentProps<'div'>) {
  const { viewport, vertical } = useCarousel()
  return (
    <div
      ref={viewport}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn('flex', vertical ? '-mt-4 flex-col' : '-ml-4', className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: ComponentProps<'div'>) {
  const { vertical } = useCarousel()
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        vertical ? 'pt-4' : 'pl-4',
        className,
      )}
      {...props}
    />
  )
}

/** The words CarouselPrevious writes, to change on one CarouselPrevious only. */
type CarouselPreviousLabels = Partial<Pick<GoGoUIMessages, 'previousSlide'>>

/** **Key props**: `labels` to change its words. */
function CarouselPrevious({
  className,
  labels,
  ...props
}: ComponentProps<typeof Button> & {
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: CarouselPreviousLabels
}) {
  const { api, vertical, canPrevious } = useCarousel()
  const { previousSlide } = useGoGoUIMessages(labels)
  return (
    <Button
      variant="outline"
      size="icon-sm"
      data-slot="carousel-previous"
      aria-label={previousSlide}
      disabled={!canPrevious}
      onClick={() => api?.scrollPrev()}
      className={cn(
        'absolute rounded-full',
        vertical
          ? '-top-12 left-1/2 -translate-x-1/2 rotate-90'
          : 'top-1/2 -left-12 -translate-y-1/2',
        className,
      )}
      {...props}
    >
      <GoGoIcon name="chevronLeft" aria-hidden="true" />
    </Button>
  )
}

/** The words CarouselNext writes, to change on one CarouselNext only. */
type CarouselNextLabels = Partial<Pick<GoGoUIMessages, 'nextSlide'>>

/** **Key props**: `labels` to change its words. */
function CarouselNext({
  className,
  labels,
  ...props
}: ComponentProps<typeof Button> & {
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: CarouselNextLabels
}) {
  const { api, vertical, canNext } = useCarousel()
  const { nextSlide } = useGoGoUIMessages(labels)
  return (
    <Button
      variant="outline"
      size="icon-sm"
      data-slot="carousel-next"
      aria-label={nextSlide}
      disabled={!canNext}
      onClick={() => api?.scrollNext()}
      className={cn(
        'absolute rounded-full',
        vertical
          ? '-bottom-12 left-1/2 -translate-x-1/2 rotate-90'
          : 'top-1/2 -right-12 -translate-y-1/2',
        className,
      )}
      {...props}
    >
      <GoGoIcon name="chevronRight" aria-hidden="true" />
    </Button>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
export type {
  CarouselApi,
  CarouselProps,
  CarouselLabels,
  CarouselPreviousLabels,
  CarouselNextLabels,
}
