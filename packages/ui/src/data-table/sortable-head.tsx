import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
} from '@phosphor-icons/react'
import type { Header } from '@tanstack/react-table'

import { TableHead } from '../components/table.tsx'
import { cn } from '../lib/cn.ts'
import { hideBelowClasses } from './table-hook.ts'
import type { DataTableInstance, dataTableFeatures } from './table-hook.ts'

/**
 * A column header: a button that sorts the column when it can, the
 * direction said by `aria-sort` and drawn by an arrow.
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
  const sorted = column.getIsSorted()
  const ariaSort =
    sorted === 'asc'
      ? 'ascending'
      : sorted === 'desc'
        ? 'descending'
        : undefined

  return (
    <TableHead
      scope="col"
      aria-sort={ariaSort}
      className={cn(
        // 44 px to sort under a finger, 36 with a mouse. Headers are
        // labels: quieter than the data, the sorted one comes forward.
        'h-auto px-3 py-1 whitespace-normal text-fg-muted',
        sorted && 'text-fg',
        meta?.amount && 'text-right',
        // The layout is fixed: these widths hold whatever the rows.
        meta?.width ??
          (meta?.title
            ? 'w-1/4'
            : meta?.amount
              ? 'w-32'
              : meta?.actions && 'w-20'),
        meta?.hideBelow && hideBelowClasses[meta.hideBelow],
      )}
    >
      {header.isPlaceholder ? null : column.getCanSort() && !covered ? (
        <button
          type="button"
          onClick={column.getToggleSortingHandler()}
          className={cn(
            'inline-flex min-h-11 items-center gap-1 rounded-md font-medium outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-line-focus pointer-fine:min-h-9',
            meta?.amount && 'flex-row-reverse',
          )}
        >
          <table.FlexRender header={header} />
          {sorted === 'asc' ? (
            <ArrowUpIcon aria-hidden="true" className="size-3.5 text-fg" />
          ) : sorted === 'desc' ? (
            <ArrowDownIcon aria-hidden="true" className="size-3.5 text-fg" />
          ) : (
            <ArrowsDownUpIcon
              aria-hidden="true"
              className="size-3.5 text-fg-subtle"
            />
          )}
        </button>
      ) : (
        <span className="inline-flex min-h-11 items-center font-medium pointer-fine:min-h-9">
          <table.FlexRender header={header} />
        </span>
      )}
    </TableHead>
  )
}
