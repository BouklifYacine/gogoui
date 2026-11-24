import type { ReactNode } from 'react'

import { ExpandingSearch } from '../components/expanding-search.tsx'
import { cn } from '../lib/cn.ts'
import { SortChip } from './sort-chip.tsx'
import type { DataTableInstance } from './table-hook.ts'

/**
 * Above the rows: the text filter when the list offers one, the list's
 * filters, and on a phone the « Trier » chip that replaces the headers
 * (`md:hidden`: the server's page shows it on a phone too).
 */
export function DataTableToolbar<TData extends { id: string }>({
  table,
  filterId,
  filterLabel,
  filters,
  className,
}: {
  table: DataTableInstance<TData>
  /** The search's id: « Effacer le filtre » focuses its glass. */
  filterId: string
  filterLabel: string | undefined
  filters: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 sm:gap-4', className)}
    >
      <SortChip table={table} className="md:hidden" />
      {(filterLabel || filters) && (
        <div className="flex flex-1 items-center justify-end gap-2">
          {filterLabel && (
            <ExpandingSearch
              id={filterId}
              label={filterLabel}
              value={String(table.state.globalFilter ?? '')}
              onValueChange={(text) => table.setGlobalFilter(text)}
            />
          )}
          {filters}
        </div>
      )}
    </div>
  )
}
