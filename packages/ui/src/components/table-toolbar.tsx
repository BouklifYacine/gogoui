import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'

type TableToolbarProps = {
  /** On the left: what is shown (tabs, a title, a count). */
  start?: ReactNode
  /** On the right: the search (ExpandingSearch), the filters (FilterMenu), « Colonnes ». */
  filters?: ReactNode
  /** At the end: the list's buttons (« Exporter », « Ajouter »). */
  actions?: ReactNode
  /** Under it, full width: the active filters (FilterChips). */
  children?: ReactNode
  className?: string
}

/**
 * The line above a table for its search, filters and buttons.
 *
 * **Key props**: `start` (search or tabs on the left), `filters`,
 * `actions` (buttons on the right), children (a second line: chips).
 *
 * **Where**: right above the table, inside its card.
 *
 * @summary The line above a table for its search, filters and buttons.
 */
function TableToolbar({
  start,
  filters,
  actions,
  children,
  className,
}: TableToolbarProps) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn('flex flex-col gap-3', className)}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {start && (
          <div className="flex min-w-0 items-center gap-3">{start}</div>
        )}
        {(filters || actions) && (
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            {filters}
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export { TableToolbar }
export type { TableToolbarProps }
