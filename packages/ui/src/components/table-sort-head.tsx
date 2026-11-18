import type { ComponentProps, MouseEvent } from 'react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
} from '@phosphor-icons/react'

import { cn } from '../lib/cn.ts'
import { TableHead } from './table.tsx'

type TableSortHeadProps = Omit<ComponentProps<'th'>, 'align'> & {
  /** How the column is sorted now: up, down, or not (false). */
  sort?: 'asc' | 'desc' | false
  /** Called on a click: your code decides the next order. */
  onSort?: (event: MouseEvent<HTMLButtonElement>) => void
  /** A count or an amount: aligned right, its arrow on the left. */
  align?: 'start' | 'end'
}

/**
 * A column header that sorts its column: a button with an arrow, the
 * order told by `aria-sort`. It sorts nothing itself: give it the current
 * `sort` and an `onSort`, and sort your rows. Without `onSort`, a plain
 * header.
 *
 * @summary A sortable column header, without sorting logic.
 */
function TableSortHead({
  sort = false,
  onSort,
  align = 'start',
  className,
  children,
  ...props
}: TableSortHeadProps) {
  const Arrow =
    sort === 'asc' ? ArrowUpIcon : sort === 'desc' ? ArrowDownIcon : null
  return (
    <TableHead
      scope="col"
      aria-sort={
        sort === 'asc'
          ? 'ascending'
          : sort === 'desc'
            ? 'descending'
            : undefined
      }
      data-slot="table-sort-head"
      className={cn(
        sort && 'text-fg',
        align === 'end' && 'text-right',
        className,
      )}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            'inline-flex min-h-11 items-center gap-1 rounded-md font-medium outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-line-focus pointer-fine:min-h-9',
            align === 'end' && 'flex-row-reverse',
          )}
        >
          {children}
          {Arrow ? (
            <Arrow aria-hidden="true" className="size-3.5 text-fg" />
          ) : (
            <ArrowsDownUpIcon
              aria-hidden="true"
              className="size-3.5 text-fg-subtle"
            />
          )}
        </button>
      ) : (
        children
      )}
    </TableHead>
  )
}

export { TableSortHead }
export type { TableSortHeadProps }
