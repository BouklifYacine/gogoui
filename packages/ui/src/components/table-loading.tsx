import { Skeleton } from './skeleton.tsx'
import { TableCell, TableRow } from './table.tsx'

type TableLoadingProps = {
  /** How many columns the table has. */
  columns: number
  /** How many grey rows, 5 by default: about a page. */
  rows?: number
  /** A box column first, when the rows can be ticked. */
  selectable?: boolean
}

// Bars of different lengths, so the rows read as text rather than a wall.
const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-5/6']

/**
 * A table's grey rows while they load.
 *
 * **Key props**: `columns`, `rows`, `selectable` (a box column first).
 *
 * @summary A table's rows while they load.
 */
function TableLoading({ columns, rows = 5, selectable }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <TableRow
          key={row}
          data-slot="table-loading"
          aria-hidden="true"
          className="hover:bg-transparent"
        >
          {selectable && (
            <TableCell className="w-12 px-3">
              <Skeleton className="size-4 rounded-xs" />
            </TableCell>
          )}
          {Array.from({ length: columns }, (_, column) => (
            <TableCell key={column}>
              <Skeleton
                className={`h-4 ${widths[(row + column) % widths.length] ?? 'w-1/2'}`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export { TableLoading }
export type { TableLoadingProps }
