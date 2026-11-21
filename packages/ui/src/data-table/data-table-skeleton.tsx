import { Fragment } from 'react'
import type { ReactNode } from 'react'

import {
  Skeleton,
  SkeletonButton,
  SkeletonText,
} from '../components/skeleton.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { hideBelowClasses } from './table-hook.ts'
import type { DataColumnMeta } from './table-hook.ts'

// What the skeleton reads of a list's own columns.
type SkeletonColumn = {
  id?: string
  accessorKey?: unknown
  header?: unknown
  meta?: unknown
  enableSorting?: boolean
  sortFn?: unknown
}

/** A row of the skeleton: by column id, a sample to show in grey. */
export type SkeletonRow = Record<string, ReactNode>

const idOf = (column: SkeletonColumn) =>
  column.id ??
  (typeof column.accessorKey === 'string' ? column.accessorKey : '')
const metaOf = (column: SkeletonColumn) => (column.meta ?? {}) as DataColumnMeta
const headerOf = (column: SkeletonColumn) =>
  typeof column.header === 'string' ? column.header : ''

// Words are drawn as grey text; anything else (a badge) as it is.
function sample(value: ReactNode) {
  return typeof value === 'string' ? (
    <SkeletonText>{value}</SkeletonText>
  ) : (
    value
  )
}

// The « … » of a row: 44 px under a thumb, 32 at a desk.
const actionsSample = <Skeleton className="size-11 rounded-lg md:size-8" />

/**
 * A list while its rows load.
 *
 * **Use it for** the route's pending state, before `DataTable` has data.
 *
 * **Key props**: `columns` (the same as the table, so widths match),
 * `rows`, `selectable`.
 *
 * @summary A list while its rows load.
 */
export function DataTableSkeleton({
  columns,
  rows,
  selectable,
  pagination,
  pages = 4,
}: {
  columns: readonly SkeletonColumn[]
  rows: SkeletonRow[]
  /** A box in front of each row. */
  selectable?: boolean
  /** The pages under the list, with its count (« 1 à 10 sur 40 »). */
  pagination?: string
  /** The page buttons between previous and next. */
  pages?: number
}) {
  const messages = useGoGoUIMessages()
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm max-md:hidden">
        <Table className="min-w-2xl table-fixed text-sm">
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12 px-3">
                  <Skeleton className="size-4 rounded-xs" />
                </TableHead>
              )}
              {columns.map((column) => {
                const meta = metaOf(column)
                const sorts =
                  column.sortFn !== undefined && column.enableSorting !== false
                return (
                  <TableHead
                    key={idOf(column)}
                    className={cn(
                      'h-auto px-3 py-1 whitespace-normal',
                      meta.amount && 'text-right',
                      meta.width ??
                        (meta.title
                          ? 'w-1/4'
                          : meta.amount
                            ? 'w-32'
                            : meta.actions && 'w-20'),
                      meta.hideBelow && hideBelowClasses[meta.hideBelow],
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex min-h-11 items-center gap-1 font-medium pointer-fine:min-h-9',
                        meta.amount && 'flex-row-reverse',
                      )}
                    >
                      <SkeletonText>{headerOf(column)}</SkeletonText>
                      {sorts && <span className="size-3.5" />}
                    </span>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                {selectable && (
                  <TableCell className="w-12 px-3">
                    <Skeleton className="size-4 rounded-xs" />
                  </TableCell>
                )}
                {columns.map((column) => {
                  const meta = metaOf(column)
                  return (
                    <TableCell
                      key={idOf(column)}
                      className={cn(
                        'px-3 py-2.5 break-words whitespace-normal',
                        meta.title && 'font-medium',
                        meta.amount && 'text-right tabular-nums',
                        meta.hideBelow && hideBelowClasses[meta.hideBelow],
                      )}
                    >
                      {meta.actions ? (
                        <span className="flex flex-wrap gap-2">
                          {row[idOf(column)] ?? actionsSample}
                        </span>
                      ) : (
                        sample(row[idOf(column)])
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col divide-y divide-line rounded-2xl bg-card shadow-sm md:hidden">
        {rows.map((row, index) => {
          const shown = columns.filter((column) => !metaOf(column).phoneHidden)
          const title = shown.find((column) => metaOf(column).title)
          const actions = shown.find((column) => metaOf(column).actions)
          const details = shown.filter(
            (column) => column !== title && column !== actions,
          )
          return (
            <li key={index} className="flex flex-col gap-2 px-4 py-4">
              {title && (
                <div className="font-medium">{sample(row[idOf(title)])}</div>
              )}
              {details.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  {details.map((column) => (
                    <Fragment key={idOf(column)}>
                      <dt>
                        <SkeletonText>{headerOf(column)}</SkeletonText>
                      </dt>
                      <dd
                        className={cn(metaOf(column).amount && 'tabular-nums')}
                      >
                        {sample(row[idOf(column)])}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              )}
              {actions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {row[idOf(actions)] ?? actionsSample}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {pagination && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>
            <SkeletonText>{pagination}</SkeletonText>
          </p>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 max-md:hidden">
              <SkeletonText>{messages.rowsPerPage}</SkeletonText>
              <Skeleton className="h-9 w-20 rounded-button" />
            </div>
            <div className="flex items-center gap-1 max-md:w-full max-md:justify-between">
              <SkeletonButton className="pl-3">
                <span className="size-3.5" />
                {messages.previous}
              </SkeletonButton>
              {Array.from({ length: pages }, (_, page) => (
                <SkeletonButton
                  key={page}
                  size="icon"
                  className="max-md:hidden"
                />
              ))}
              <SkeletonButton className="pr-3">
                {messages.next}
                <span className="size-3.5" />
              </SkeletonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
