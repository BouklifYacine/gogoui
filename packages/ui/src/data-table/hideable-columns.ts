import type { DataTableInstance } from './table-hook.ts'

/**
 * The columns « Colonnes » offers to hide: all but the row's name and its
 * actions, without which a row could not be read or opened.
 */
export function hideableColumns<TData extends { id: string }>(
  table: DataTableInstance<TData>,
) {
  return table.getAllLeafColumns().filter((column) => {
    const meta = column.columnDef.meta
    return column.getCanHide() && !meta?.title && !meta?.actions
  })
}

/** A column's header as words, its id when the header is not text. */
export function columnLabel(column: {
  id: string
  columnDef: { header?: unknown }
}): string {
  return typeof column.columnDef.header === 'string'
    ? column.columnDef.header
    : column.id
}
