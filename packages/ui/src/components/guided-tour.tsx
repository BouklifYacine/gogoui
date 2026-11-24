import { useRef } from 'react'
import { EVENTS, Joyride } from 'react-joyride'
import type { EventHandler, FloatingOptions, Step } from 'react-joyride'

import type { GoGoUIMessages } from '../i18n/messages.ts'
import { GuideTooltip } from '../internal/guide-tooltip.tsx'
import { LabelsScope } from '../internal/labels-scope.tsx'

type GuideStep = {
  /** The `data-guide` attribute of the element the bubble points at. */
  target: string
  title: string
  content: string
  /**
   * The last bubble waits for the person to do it: a click on the element
   * ends the guide, and the element does what it always does.
   */
  action?: true
}

/** A page's short guide. */
type Guide = {
  /** Its name in your measures, never shown. */
  name: string
  /** What the guide teaches, on the card that offers it (« créer un devis »). */
  title: string
  steps: GuideStep[]
}

/** The words GuidedTour writes in its bubbles, to change on one tour only. */
type GuidedTourLabels = Partial<
  Pick<GoGoUIMessages, 'stepOf' | 'guideStop' | 'next'>
>

type GuidedTourProps = {
  guide: Guide
  /** Finished or stopped. */
  onDone: () => void
  /** For your measures. */
  onStart?: () => void
  /** For your measures: whether the last bubble was reached. */
  onFinish?: (reachedEnd: boolean) => void
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: GuidedTourLabels
}

// On a phone, a bubble beside its element hides what it points at: it
// becomes a band at the bottom of the screen, the element lit above it.
const PHONE = '(max-width: 639px)'
const bottomBand: Partial<FloatingOptions> = {
  strategy: 'fixed',
  hideArrow: true,
  middleware: [
    {
      name: 'bottomBand',
      fn: ({ rects }) => ({
        x: (window.innerWidth - rects.floating.width) / 2,
        y: window.innerHeight - rects.floating.height - 16,
      }),
    },
  ],
}

/**
 * A short guided tour of a page's elements, bubble by bubble.
 *
 * **Use it for** a page's first visit, 3 to 5 steps, offered by
 * `GuideOffer`, never forced.
 *
 * **Key props**: `guide` (`{ name, title, steps }`, each step `{ target,
 * title, content, action? }`, `target` the element's `data-guide`),
 * `onDone`, `onStart`, `onFinish`, `labels` to change its words.
 *
 * **Accessibility**: each bubble is a dialog; Escape stops the tour.
 *
 * @summary A short guided tour of a page's elements.
 */
function GuidedTour({
  guide,
  onDone,
  onStart,
  onFinish,
  labels,
}: GuidedTourProps) {
  const phone =
    typeof window !== 'undefined' && window.matchMedia(PHONE).matches
  const steps: Step[] = guide.steps.map((step) => ({
    target: `[data-guide="${step.target}"]`,
    title: step.title,
    content: step.content,
    buttons: step.action ? ['skip'] : ['skip', 'primary'],
    data: { action: step.action === true },
  }))

  // Whether its last bubble was shown.
  const reachedEnd = useRef(false)

  const onEvent: EventHandler = (data, controls) => {
    if (data.type === EVENTS.TOUR_START) {
      onStart?.()
    }
    // The bubble that waits: a click on the element ends the guide, and
    // the element goes on to do its job.
    if (data.type === EVENTS.TOOLTIP && data.step.data?.action === true) {
      reachedEnd.current = true
      const target = document.querySelector(String(data.step.target))
      target?.addEventListener('click', () => controls.skip(), { once: true })
    }
    if (data.type === EVENTS.TOUR_END) {
      onFinish?.(reachedEnd.current)
      onDone()
    }
  }

  return (
    <LabelsScope labels={labels}>
      <Joyride
        run
        continuous
        steps={steps}
        onEvent={onEvent}
        tooltipComponent={GuideTooltip}
        floatingOptions={phone ? bottomBand : { hideArrow: true }}
        options={{
          skipBeacon: true,
          // Only its buttons end it: a stray tap beside the bubble does not.
          overlayClickAction: false,
          width: phone ? 'calc(100vw - 32px)' : 380,
          zIndex: 60,
        }}
      />
    </LabelsScope>
  )
}

export { GuidedTour }
export type { Guide, GuideStep, GuidedTourLabels, GuidedTourProps }
