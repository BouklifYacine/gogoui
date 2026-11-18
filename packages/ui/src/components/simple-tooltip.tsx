import type { ReactElement, ReactNode } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip.tsx'

type SimpleTooltipProps = {
  /** What the tooltip says. */
  content: ReactNode
  /** The element it explains: a button, a link. It stays that element. */
  children: ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** How long the pointer rests before it shows, in ms; 0 by default. */
  delay?: number
}

/**
 * A tooltip in one line: `<SimpleTooltip content="Notifications"><Button
 * … /></SimpleTooltip>`. The element keeps its own name (`aria-label` on
 * an icon button): a tooltip is never the only name. For more control,
 * compose `Tooltip` yourself.
 *
 * @summary A tooltip in one line around any element.
 */
function SimpleTooltip({
  content,
  children,
  side = 'top',
  delay = 0,
}: SimpleTooltipProps) {
  return (
    <TooltipProvider delay={delay}>
      <Tooltip>
        <TooltipTrigger render={children} />
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { SimpleTooltip }
export type { SimpleTooltipProps }
