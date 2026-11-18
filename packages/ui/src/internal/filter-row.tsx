import { CaretRightIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { useFilterLayout } from './filter-layout.ts'

/**
 * A group in the list of filters. On a computer it selects the controls
 * beside the list; on a phone it opens them in the drawer.
 */
export function FilterRow({
  label,
  summary,
  onOpen,
  icon: GroupIcon,
}: {
  label: string
  /** What is chosen in words; null when nothing is. */
  summary: string | null
  onOpen: () => void
  icon?: Icon
}) {
  const { activeSummary } = useGoGoUIMessages()
  const layout = useFilterLayout()
  const sidebar = layout.mode === 'row' && layout.sidebar === true
  const selected = layout.mode === 'row' && layout.selected === true

  return (
    <button
      id={layout.mode === 'row' ? layout.id : undefined}
      type="button"
      onClick={onOpen}
      aria-pressed={sidebar ? selected : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg text-left outline-none hover:bg-hover focus-visible:outline-2 focus-visible:outline-line-focus',
        sidebar ? 'min-h-11 px-3 text-sm text-fg-muted' : 'min-h-14 px-2',
        sidebar && selected && 'bg-hover text-fg',
      )}
    >
      {layout.mode === 'row' && layout.showIcon && GroupIcon && (
        <GroupIcon aria-hidden="true" className="size-3.5 shrink-0" />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{label}</span>
        {summary && (
          <span
            className={sidebar ? 'sr-only' : 'truncate text-sm text-fg-muted'}
          >
            {sidebar ? activeSummary(summary) : summary}
          </span>
        )}
      </span>
      {sidebar && summary && (
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-primary"
        />
      )}
      {(!sidebar || selected) && (
        <CaretRightIcon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-fg-subtle"
        />
      )}
    </button>
  )
}
