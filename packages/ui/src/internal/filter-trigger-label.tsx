import { FunnelSimpleIcon } from '@phosphor-icons/react'

import { Badge } from '../components/badge.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'

/** The « Filtrer » button's words: how many filters are on beside it. */
export function FilterTriggerLabel({ activeCount }: { activeCount: number }) {
  const messages = useGoGoUIMessages()
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
