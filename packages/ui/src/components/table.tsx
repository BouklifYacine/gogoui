import * as React from 'react'
import { cn } from '../lib/cn.ts'

/**
 * The styled parts of an HTML table.
 *
 * **Use it for** any table; add the table kit (`TableSortHead`,
 * `TableSelectAll`, `TableSelectRow`, `TableToolbar`, `TablePagination`,
 * `TableEmpty`, `TableLoading`) for its controls. **Prefer** `DataTable`
 * for records with sorting, filters and a phone view done for you.
 *
 * **Where**: in a card or full width of the page.
 *
 * **Compose**: `Table` > `TableCaption` + `TableHeader` > `TableRow` >
 * `TableHead`s, `TableBody` > `TableRow`s > `TableCell`s, `TableFooter`
 * for totals.
 *
 * **Accessibility**: a caption (visible or `sr-only`), headers in `th`;
 * numbers aligned right.
 *
 * @summary A data table with its header and rows.
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b [&_tr]:hover:bg-transparent', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t bg-table-head font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-line transition-colors hover:bg-hover has-aria-expanded:bg-hover data-[state=selected]:bg-primary-subtle',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-9 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-fg-muted [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-3 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-fg-muted', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
