import { useId } from 'react'
import { CompassIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { Button } from './button.tsx'

/** The words GuideOffer writes, to change on one GuideOffer only. */
type GuideOfferLabels = Partial<
  Pick<
    GoGoUIMessages,
    'guideOffer' | 'guideLength' | 'guideStart' | 'guideDecline'
  >
>

type GuideOfferProps = {
  /** What the guide teaches (« créer un devis »). */
  title: string
  /** How many steps it has. */
  steps: number
  onStart: () => void
  onDecline: () => void
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: GuideOfferLabels
}

/**
 * The card offering a page's guide, once, in the page.
 *
 * **Key props**: `title` (what it teaches), `steps` (how many), `onStart`,
 * `onDecline` (« Non merci » removes it for good).
 *
 * @summary The card offering a page's guide.
 */
function GuideOffer({
  title,
  steps,
  onStart,
  onDecline,
  labels,
}: GuideOfferProps) {
  const messages = useGoGoUIMessages(labels)
  const titleId = useId()
  return (
    <section
      aria-labelledby={titleId}
      data-slot="guide-offer"
      className="flex flex-col gap-3 rounded-lg border border-line bg-tray p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <CompassIcon
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-fg"
        />
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="font-medium text-fg">
            {messages.guideOffer(title)}
          </h2>
          <p className="text-fg-muted">{messages.guideLength(steps)}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button onClick={onStart}>
          <CompassIcon aria-hidden="true" />
          {messages.guideStart}
        </Button>
        <Button variant="ghost" onClick={onDecline}>
          {messages.guideDecline}
        </Button>
      </div>
    </section>
  )
}

export { GuideOffer }
export type { GuideOfferProps, GuideOfferLabels }
