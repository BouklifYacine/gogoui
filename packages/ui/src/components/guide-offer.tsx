import { useId } from 'react'
import { CompassIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { Button } from './button.tsx'

type GuideOfferProps = {
  /** What the guide teaches (« créer un devis »). */
  title: string
  /** How many steps it has. */
  steps: number
  onStart: () => void
  onDecline: () => void
}

/**
 * The card that offers a page's guide, once, in the page and never over
 * it: a window opened on its own is the one people finish least.
 * « Non merci » removes it for good.
 *
 * @summary The card offering a page's guide.
 */
function GuideOffer({ title, steps, onStart, onDecline }: GuideOfferProps) {
  const messages = useGoGoUIMessages()
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
export type { GuideOfferProps }
