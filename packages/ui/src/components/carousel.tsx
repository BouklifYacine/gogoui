import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useSyncExternalStore,
} from 'react'
import type { ComponentProps, KeyboardEvent } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { UseEmblaCarouselType } from 'embla-carousel-react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
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
  /** Reduced motion: the arrows jump to the slide instead of scrolling. */
  jump: boolean
  /** The slides' words, so a Carousel's `labels` reach them. */
  messages: Pick<GoGoUIMessages, 'slide' | 'slideOf'>
}

const CarouselContext = createContext<CarouselState | null>(null)

// Each slide's place among its siblings, for its « 2 sur 5 ».
const SlidePositionContext = createContext<{
  index: number
  total: number
} | null>(null)

function useCarousel(): CarouselState {
  const state = use(CarouselContext)
  if (!state) {
    throw new Error('A carousel part must sit inside a Carousel.')
  }
  return state
}

const idle = 'false|false|0|0'

/** The words Carousel writes, to change on one Carousel only. */
type CarouselLabels = Partial<Pick<GoGoUIMessages, 'slide' | 'slideOf'>>

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
 * Each slide is a group, a « diapositive » named « 2 sur 5 » (pass
 * `aria-label` to a `CarouselItem` to name it yourself). At either end
 * the disabled arrow keeps the focus. With reduced motion the arrows and
 * the keys jump to the slide instead of scrolling.
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
  const reduce = useReduceMotion()
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
    jump: reduce,
    messages,
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) {
      event.preventDefault()
      api?.scrollPrev(reduce)
    } else if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) {
      event.preventDefault()
      api?.scrollNext(reduce)
    }
  }

  return (
    <CarouselContext value={state}>
      <section
        aria-roledescription={messages.carouselRole}
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

function CarouselContent({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  const { viewport, vertical } = useCarousel()
  // Empty slots (a `cond && <CarouselItem>`) are not slides.
  const slides = Children.toArray(children)
  return (
    <div
      ref={viewport}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn('flex', vertical ? '-mt-4 flex-col' : '-ml-4', className)}
        {...props}
      >
        {slides.map((slide, index) => (
          <SlidePositionContext
            // toArray has already keyed each slide.
            key={isValidElement(slide) ? slide.key : index}
            value={{ index, total: slides.length }}
          >
            {slide}
          </SlidePositionContext>
        ))}
      </div>
    </div>
  )
}

function CarouselItem({ className, ...props }: ComponentProps<'div'>) {
  const { vertical, messages } = useCarousel()
  const position = use(SlidePositionContext)
  return (
    <div
      role="group"
      aria-roledescription={messages.slide}
      aria-label={
        position
          ? messages.slideOf(position.index + 1, position.total)
          : undefined
      }
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
  const { api, vertical, canPrevious, jump } = useCarousel()
  const { previousSlide } = useGoGoUIMessages(labels)
  return (
    <Button
      variant="outline"
      size="icon-sm"
      data-slot="carousel-previous"
      aria-label={previousSlide}
      disabled={!canPrevious}
      // At the end the arrow turns off under the focus: it keeps it
      // (aria-disabled) rather than dropping it on the page.
      focusableWhenDisabled
      onClick={() => api?.scrollPrev(jump)}
      className={cn(
        'absolute rounded-full data-disabled:pointer-events-none data-disabled:opacity-60',
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
  const { api, vertical, canNext, jump } = useCarousel()
  const { nextSlide } = useGoGoUIMessages(labels)
  return (
    <Button
      variant="outline"
      size="icon-sm"
      data-slot="carousel-next"
      aria-label={nextSlide}
      disabled={!canNext}
      // At the end the arrow turns off under the focus: it keeps it
      // (aria-disabled) rather than dropping it on the page.
      focusableWhenDisabled
      onClick={() => api?.scrollNext(jump)}
      className={cn(
        'absolute rounded-full data-disabled:pointer-events-none data-disabled:opacity-60',
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
