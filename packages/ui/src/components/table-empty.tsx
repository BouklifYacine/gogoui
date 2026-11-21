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
 * A table's single row when it has no data.
 *
 * **Key props**: `colSpan` (all columns), children (an `EmptyState` or a
 * sentence with its way out).
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
