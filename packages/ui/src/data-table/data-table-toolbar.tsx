import type { ReactNode } from 'react'

import { ExpandingSearch } from '../components/expanding-search.tsx'
import { SortChip } from './sort-chip.tsx'
import type { DataTableInstance } from './table-hook.ts'

/**
 * Above the rows: the text filter when the list offers one, the list's
 * filters, and on a phone the « Trier » chip that replaces the headers.
 */
export function DataTableToolbar<TData extends { id: string }>({
  table,
  filterId,
  filterLabel,
  filters,
  sortSelect,
}: {
  table: DataTableInstance<TData>
  /** The search's id: « Effacer le filtre » focuses its glass. */
  filterId: string
  filterLabel: string | undefined
  filters: ReactNode
  sortSelect: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {sortSelect && <SortChip table={table} />}
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
