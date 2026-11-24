import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { pageWindow } from '../internal/page-window.ts'
import { cn } from '../lib/cn.ts'
import { PageSizeSelect } from './page-size-select.tsx'
import type { PageSizeSelectLabels } from './page-size-select.tsx'
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from './pagination.tsx'
import type {
  PaginationLabels,
  PaginationNextLabels,
  PaginationPreviousLabels,
} from './pagination.tsx'

/**
 * The words TablePagination writes, and those of the page size select and
 * the pagination it draws, to change on one TablePagination only.
 */
type TablePaginationLabels = Partial<
  Pick<GoGoUIMessages, 'rowsRange' | 'page'>
> &
  PageSizeSelectLabels &
  PaginationLabels &
  PaginationPreviousLabels &
  PaginationNextLabels

type TablePaginationProps = {
  /** The page shown, counted from 1. */
  page: number
  /** How many rows a page shows. */
  pageSize: number
  /** How many rows in all. */
  total: number
  onPageChange: (page: number) => void
  /** Given, « Lignes par page » shows. */
  onPageSizeChange?: (size: number) => void
  pageSizes?: readonly number[]
  /** The rows in all, in words: « 257 clients ». The figure by default. */
  rowsLabel?: (count: number) => string
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: TablePaginationLabels
}

/**
 * A table's pages and page size, without the paging logic.
 *
 * **Key props**: `page` + `onPageChange`, `pageSize` + `onPageSizeChange`,
 * `pageSizes`, `total`, `rowsLabel` (« 257 demandes »),
 * `labels` to change its words.
 *
 * **Where**: under the table, inside its card.
 *
 * **Accessibility**: a `nav`; the range « 1–25 sur 257 » is read.
 *
 * @summary A table's pages and page size, without paging logic.
 */
function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes,
  rowsLabel = (count) => String(count),
  className,
  labels,
}: TablePaginationProps) {
  const messages = useGoGoUIMessages(labels)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      {/* Read aloud when the page changes, without moving the focus. */}
      <p role="status" className="text-sm text-fg-muted tabular-nums">
        {messages.rowsRange(first, last, rowsLabel(total))}
      </p>
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        {onPageSizeChange && (
          <PageSizeSelect
            value={pageSize}
            sizes={pageSizes}
            onValueChange={onPageSizeChange}
            labels={labels}
          />
        )}
        <Pagination className="mx-0 w-auto" labels={labels}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                labels={labels}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              />
            </PaginationItem>
            {pageWindow(page, pageCount).map((slot, index) =>
              slot === 'gap' ? (
                <PaginationItem key={`gap-${index}`} className="max-md:hidden">
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={slot} className="max-md:hidden">
                  <PaginationButton
                    isActive={slot === page}
                    aria-label={messages.page(slot)}
                    onClick={() => onPageChange(slot)}
                  >
                    {slot}
                  </PaginationButton>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                labels={labels}
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

export { TablePagination }
export type { TablePaginationProps, TablePaginationLabels }
