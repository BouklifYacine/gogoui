import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'
import { TableCell, TableRow } from './table.tsx'

type TableEmptyProps = {
  /** How many columns the table has: the message spans them all. */
  colSpan: number
  /** The message, or an `EmptyState`. */
  children: ReactNode
  className?: string
}

/**
 * The one row of a table with no data (« Aucun client pour ce filtre »),
 * across all its columns, so the header stays in place.
 *
 * @summary A table's row when it has no data.
 */
function TableEmpty({ colSpan, children, className }: TableEmptyProps) {
  return (
    <TableRow data-slot="table-empty" className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className={cn(
          'h-32 text-center whitespace-normal text-fg-muted',
          className,
        )}
      >
        {children}
      </TableCell>
    </TableRow>
  )
}

export { TableEmpty }
export type { TableEmptyProps }
