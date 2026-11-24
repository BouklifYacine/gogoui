import { FunnelSimpleIcon } from '@phosphor-icons/react'

import { Badge } from '../components/badge.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'

/** The words FilterTriggerLabel writes, to change on one FilterTriggerLabel only. */
type FilterTriggerLabelLabels = Partial<
  Pick<GoGoUIMessages, 'filter' | 'activeFilterCount'>
>

/**
 * The « Filtrer » button's words: how many filters are on beside it.
 *
 * **Key props**: `labels` to change its words.
 */
export function FilterTriggerLabel({
  activeCount,
  labels,
}: {
  activeCount: number
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: FilterTriggerLabelLabels
}) {
  const messages = useGoGoUIMessages(labels)
  return (
    <>
      <FunnelSimpleIcon aria-hidden="true" />
      {messages.filter}
      {activeCount > 0 && (
        <>
          <Badge aria-hidden="true" variant="secondary">
            {activeCount}
          </Badge>
          <span className="sr-only">
            {messages.activeFilterCount(activeCount)}
          </span>
        </>
      )}
    </>
  )
}
export type { FilterTriggerLabelLabels }
