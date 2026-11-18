import { InfoIcon } from '@phosphor-icons/react'

import { cn } from '../lib/cn.ts'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip.tsx'

type InfoTipProps = {
  /** The explanation, also the button's name for a screen reader. */
  text: string
  className?: string
}

/**
 * A small « i » beside a title: its explanation opens on hover or keyboard
 * focus instead of sitting under the title as a paragraph. The button is
 * named by the text, so a screen reader hears it without the tooltip. A
 * tooltip does not open on a tap: never hide there what a phone user needs.
 *
 * @summary A small « i » that explains a title on hover.
 */
function InfoTip({ text, className }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={text}
        data-slot="info-tip"
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full text-fg-subtle outline-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-line-focus',
          className,
        )}
      >
        <InfoIcon className="size-3.5" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="text-pretty">{text}</TooltipContent>
    </Tooltip>
  )
}

export { InfoTip }
export type { InfoTipProps }
