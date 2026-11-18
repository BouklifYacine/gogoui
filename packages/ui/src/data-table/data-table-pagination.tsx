import { Button } from '../components/button.tsx'
import { TablePagination } from '../components/table-pagination.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { DataTableInstance } from './table-hook.ts'

// The rows « Voir plus » adds on a phone.
const MORE_STEP = 20

/**
 * Under a list that pages: « 1 à 10 sur 257 demandes », the page size and
 * the pages. On a phone, « Voir 20 de plus » instead: the rows already
 * read stay, the next ones come under them, up to `maxRows`.
 */
export function DataTablePagination<TData extends { id: string }>({
  table,
  rowsLabel,
  compact,
  pageSizes,
  maxRows = 100,
}: {
  table: DataTableInstance<TData>
  /** The rows in all, in words: « 257 demandes ». */
  rowsLabel: (count: number) => string
  compact: boolean
  pageSizes?: readonly number[]
  /** The most rows a phone shows at once (your API's page limit). */
  maxRows?: number
}) {
  const messages = useGoGoUIMessages()
  const { pageIndex, pageSize } = table.state.pagination
  const total = table.getRowCount()
  const first = total === 0 ? 0 : pageIndex * pageSize + 1
  const last = Math.min(total, (pageIndex + 1) * pageSize)

  if (compact) {
    // Every row up to the end of this page.
    const left = total - last
    return (
      <div className="flex flex-col items-center gap-3">
        <p role="status" className="text-fg-muted tabular-nums">
          {messages.rowsRange(first, last, rowsLabel(total))}
        </p>
        {left > 0 &&
          (last < maxRows ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                table.setPagination({
                  pageIndex: 0,
                  pageSize: Math.min(maxRows, last + MORE_STEP),
                })
              }
            >
              {messages.showMore(Math.min(MORE_STEP, left, maxRows - last))}
            </Button>
          ) : (
            <p className="text-center text-fg-muted">
              {messages.narrowToFindMore}
            </p>
          ))}
      </div>
    )
  }

  return (
    <TablePagination
      page={pageIndex + 1}
      pageSize={pageSize}
      total={total}
      rowsLabel={rowsLabel}
      pageSizes={pageSizes}
      onPageChange={(page) => table.setPageIndex(page - 1)}
      onPageSizeChange={(size) => table.setPageSize(size)}
    />
  )
}
