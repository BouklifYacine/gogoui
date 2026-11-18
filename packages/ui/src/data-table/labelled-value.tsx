import type { Cell } from '@tanstack/react-table'

import { cn } from '../lib/cn.ts'
import { columnLabel } from './hideable-columns.ts'
import type { DataTableInstance, dataTableFeatures } from './table-hook.ts'

type DataCell<TData extends { id: string }> = Cell<
  typeof dataTableFeatures,
  TData,
  unknown
>

/** A value without its label on screen; a screen reader still hears it. */
export function LabelledValue<TData extends { id: string }>({
  table,
  cell,
}: {
  table: DataTableInstance<TData>
  cell: DataCell<TData>
}) {
  return (
    <span
      className={cn(
        'min-w-0',
        cell.column.columnDef.meta?.amount && 'tabular-nums',
      )}
    >
      <span className="sr-only">{columnLabel(cell.column)} : </span>
      <table.FlexRender cell={cell} />
    </span>
  )
}
