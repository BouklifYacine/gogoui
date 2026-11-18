import type { Header } from '@tanstack/react-table'

import { TableSortHead } from '../components/table-sort-head.tsx'
import { cn } from '../lib/cn.ts'
import { hideBelowClasses } from './table-hook.ts'
import type { DataTableInstance, dataTableFeatures } from './table-hook.ts'

/**
 * A column header of DataTable: `TableSortHead` driven by the TanStack
 * column, with the widths its meta asks for.
 */
export function SortableHead<TData extends { id: string }>({
  header,
  table,
  covered = false,
}: {
  header: Header<typeof dataTableFeatures, TData, unknown>
  table: DataTableInstance<TData>
  /** Under the ticked rows' bar: named, without a sort button. */
  covered?: boolean
}) {
  const { column } = header
  const meta = column.columnDef.meta
  const sortable = column.getCanSort() && !covered

  return (
    <TableSortHead
      sort={column.getIsSorted()}
      onSort={sortable ? column.getToggleSortingHandler() : undefined}
      align={meta?.amount ? 'end' : 'start'}
      className={cn(
        // The layout is fixed: these widths hold whatever the rows.
        'h-auto px-3 py-1 whitespace-normal',
        meta?.width ??
          (meta?.title
            ? 'w-1/4'
            : meta?.amount
              ? 'w-32'
              : meta?.actions && 'w-20'),
        meta?.hideBelow && hideBelowClasses[meta.hideBelow],
      )}
    >
      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
    </TableSortHead>
  )
}
