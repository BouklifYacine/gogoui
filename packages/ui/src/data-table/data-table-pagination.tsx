import { Button } from '../components/button.tsx'
import { PageSizeSelect } from '../components/page-size-select.tsx'
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../components/pagination.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { pageWindow } from './page-window.ts'
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
  const pageCount = Math.max(1, table.getPageCount())
  const current = pageIndex + 1
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
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Read aloud when the page changes, without moving the focus. */}
      <p role="status" className="text-fg-muted tabular-nums">
        {messages.rowsRange(first, last, rowsLabel(total))}
      </p>
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <PageSizeSelect
          value={pageSize}
          sizes={pageSizes}
          onValueChange={(size) => table.setPageSize(size)}
        />
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              />
            </PaginationItem>
            {pageWindow(current, pageCount).map((slot, index) =>
              slot === 'gap' ? (
                <PaginationItem key={`gap-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={slot}>
                  <PaginationButton
                    isActive={slot === current}
                    aria-label={messages.page(slot)}
                    onClick={() => table.setPageIndex(slot - 1)}
                  >
                    {slot}
                  </PaginationButton>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
