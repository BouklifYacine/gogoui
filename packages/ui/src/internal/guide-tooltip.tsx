import { XIcon } from '@phosphor-icons/react'
import type { TooltipRenderProps } from 'react-joyride'

import { Button } from '../components/button.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'

/**
 * One bubble of a guide: where one is, what to see, and how to stop. The
 * last bubble has no « Suivant »: it waits for the person to do what it
 * shows.
 */
export function GuideTooltip({
  index,
  size,
  step,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  const messages = useGoGoUIMessages()
  const titleId = `guide-step-${index}-title`
  return (
    <div
      {...tooltipProps}
      aria-labelledby={titleId}
      className="flex w-full flex-col gap-3 rounded-lg border border-line-strong bg-floating p-4 text-fg shadow-lg"
    >
      <p className="text-sm text-fg-muted">
        {messages.stepOf(index + 1, size)}
      </p>
      <h2 id={titleId} className="text-base font-medium">
        {step.title}
      </h2>
      <p>{step.content}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" {...skipProps}>
          <XIcon aria-hidden="true" />
          {messages.guideStop}
        </Button>
        {step.buttons?.includes('primary') && (
          <Button {...primaryProps}>{messages.next}</Button>
        )}
      </div>
    </div>
  )
}
