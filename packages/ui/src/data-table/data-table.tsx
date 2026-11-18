import { useId } from 'react'
import type { ReactNode } from 'react'

import { BulkActionsBar } from '../components/bulk-actions-bar.tsx'
import { Button } from '../components/button.tsx'
import { EmptyState } from '../components/empty-state.tsx'
import { FilterChips } from '../components/filter-chips.tsx'
import type { FilterChip } from '../components/filter-chips.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useIsMobile } from '../internal/use-is-mobile.ts'
import { DataTableCards } from './data-table-cards.tsx'
import { DataTableColumnsMenu } from './data-table-columns-menu.tsx'
import { DataTableGrid } from './data-table-grid.tsx'
import { DataTablePagination } from './data-table-pagination.tsx'
import { DataTableToolbar } from './data-table-toolbar.tsx'
import { hideableColumns } from './hideable-columns.ts'
import type { DataTableInstance } from './table-hook.ts'

type DataTableProps<TData extends { id: string }> = {
  table: DataTableInstance<TData>
  /** Names the list for screen readers (never shown). */
  caption: string
  /** Shown when the list has no row at all. */
  emptyState: ReactNode
  /** The label of a text filter over the rows (« Filtrer les clients »). */
  filterLabel?: string
  /** The list's own filters (a FilterMenu), beside the search. */
  filters?: ReactNode
  /** The filters that are on, as chips under the toolbar. */
  activeFilters?: {
    chips: FilterChip[]
    onReset: () => void
    /** Where the focus goes once the last chip is gone. */
    fallbackFocusId?: string
  }
  /** The list pages: the rows in all, in words (« 257 demandes »). */
  pagination?: {
    rowsLabel: (count: number) => string
    pageSizes?: readonly number[]
    maxRows?: number
  }
  /** Rows can be ticked, on a tablet up (`useRowSelection`). */
  selection?: {
    /** « 3 demandes sélectionnées », read aloud as it changes. */
    label: (count: number) => string
    /** The bulk actions' buttons, shown while rows are ticked. */
    actions?: ReactNode
    /** Every row the filters keep, on every page, offered once the page is ticked. */
    selectAll?: { count: number; onSelect: () => void; loading?: boolean }
  }
  /** Opens a row's details when its cells are clicked. */
  onRowClick?: (row: TData) => void
  /** The row whose details are open. */
  selectedRowId?: string | null
  /** « Colonnes » beside the filters, on a tablet up. */
  columnsMenu?: boolean
}

/**
 * A list of records: a table from a tablet up, with sortable headers;
 * dense rows on a phone, with a « Trier » chip, since columns do not fit
 * there. The same TanStack table drives both. Search, filter chips, rows
 * to tick with their actions, pages and an empty state come with it.
 * Build the table with `useDataTable` and `createDataColumns`.
 *
 * @summary A list of records: a table, or rows on a phone.
 */
export function DataTable<TData extends { id: string }>({
  table,
  caption,
  emptyState,
  filterLabel,
  filters,
  activeFilters,
  pagination,
  selection,
  columnsMenu = true,
  onRowClick,
  selectedRowId,
}: DataTableProps<TData>) {
  const messages = useGoGoUIMessages()
  const mobile = useIsMobile()
  // Every row the filter keeps, on every page.
  const matching = table.getPrePaginatedRowModel().rows.length
  const filter = String(table.state.globalFilter ?? '')
  const nothingLoaded = table.getCoreRowModel().rows.length === 0
  const filterId = useId()
  const chips: FilterChip[] = [
    ...(activeFilters?.chips ?? []),
    ...(filter.trim()
      ? [
          {
            id: `${filterId}-search`,
            label: messages.searchQuery(filter.trim()),
            onRemove: () => table.setGlobalFilter(''),
          },
        ]
      : []),
  ]
  const showColumns =
    columnsMenu && !mobile && hideableColumns(table).length >= 2
  const selected = selection ? table.getSelectedRowIds().length : 0
  const selectAll =
    selection?.selectAll &&
    table.getIsAllPageRowsSelected() &&
    selected < selection.selectAll.count
      ? {
          label: messages.selectAllCount(selection.selectAll.count),
          onSelect: selection.selectAll.onSelect,
          loading: selection.selectAll.loading,
        }
      : undefined

  // The focus would be lost with the button: it goes back to the glass.
  const clearFilter = () => {
    table.setGlobalFilter('')
    document.getElementById(`${filterId}-glass`)?.focus()
  }

  return (
    <table.AppTable>
      <div data-slot="data-table" className="flex flex-col gap-4">
        {(filterLabel || filters || mobile || showColumns) && (
          <DataTableToolbar
            table={table}
            filterId={filterId}
            filterLabel={filterLabel}
            filters={
              (filters || showColumns) && (
                <>
                  {filters}
                  {showColumns && <DataTableColumnsMenu table={table} />}
                </>
              )
            }
            sortSelect={mobile}
          />
        )}
        <FilterChips
          chips={chips}
          onReset={() => {
            activeFilters?.onReset()
            table.setGlobalFilter('')
          }}
          fallbackFocusId={
            activeFilters?.fallbackFocusId ??
            (filterLabel ? `${filterId}-glass` : undefined)
          }
        />
        {/* The ticked rows' bar lies over the head row: ticking a box
            never moves the list. */}
        <div className="@container relative flex flex-col gap-4">
          {selection && !mobile && selected > 0 && (
            <BulkActionsBar
              label={selection.label(selected)}
              actions={selection.actions}
              selectAll={selectAll}
            />
          )}
          {nothingLoaded ? (
            emptyState
          ) : matching === 0 ? (
            <EmptyState
              title={messages.noResultsFor(filter)}
              description={messages.noResultsHint}
              action={
                <Button variant="outline" onClick={clearFilter}>
                  {messages.clearFilter}
                </Button>
              }
            />
          ) : mobile ? (
            <DataTableCards
              table={table}
              caption={caption}
              selectedRowId={selectedRowId}
            />
          ) : (
            <DataTableGrid
              table={table}
              caption={caption}
              selectable={selection !== undefined}
              onRowClick={onRowClick}
              selectedRowId={selectedRowId}
            />
          )}
        </div>
        {pagination && !nothingLoaded && (
          <DataTablePagination
            table={table}
            rowsLabel={pagination.rowsLabel}
            pageSizes={pagination.pageSizes}
            maxRows={pagination.maxRows}
            compact={mobile}
          />
        )}
        {/* The count, read aloud as a filter is typed. */}
        <p role="status" className="sr-only">
          {filter === '' ? '' : messages.resultCount(matching)}
        </p>
        {/* How many rows are ticked, read aloud as it changes. */}
        {selection && (
          <p role="status" className="sr-only">
            {selected > 0 ? selection.label(selected) : ''}
          </p>
        )}
      </div>
    </table.AppTable>
  )
}
