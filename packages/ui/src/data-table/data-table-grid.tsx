import { Checkbox } from '../components/checkbox.tsx'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { SortableHead } from './sortable-head.tsx'
import { hideBelowClasses } from './table-hook.ts'
import type { DataTableInstance } from './table-hook.ts'

/**
 * The table itself, from a tablet up: one row per record, sortable
 * headers, and with `selectable` a box in front of each row.
 */
export function DataTableGrid<TData extends { id: string }>({
  table,
  caption,
  selectable = false,
  onRowClick,
  selectedRowId,
}: {
  table: DataTableInstance<TData>
  caption: string
  selectable?: boolean
  onRowClick?: (row: TData) => void
  selectedRowId?: string | null
}) {
  const messages = useGoGoUIMessages()
  const hasFooter = table
    .getAllLeafColumns()
    .some((column) => column.columnDef.footer !== undefined)
  // The row's name, for its box: « Sélectionner Julie Martin ».
  const titleColumn = table
    .getAllLeafColumns()
    .find((column) => column.columnDef.meta?.title)
  // Ids, not loaded rows: a row ticked on page 1 counts on page 2 too.
  const ticked = selectable ? table.getSelectedRowIds().length : 0
  const pageTicked = selectable && table.getIsAllPageRowsSelected()

  return (
    // overflow-hidden: the head follows the rounded corners.
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
      {/* A fixed layout: the columns take their width from the headers,
          never from the rows shown, so a new page never resizes them.
          Never narrower than 672 px: it scrolls instead. */}
      <Table className="min-w-2xl table-fixed text-sm">
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {selectable && (
                <TableHead className="w-12 px-3">
                  {/* Full once the page is ticked, a dash while some rows
                      are, and a click then unticks everything. */}
                  <Checkbox
                    aria-label={messages.selectPage}
                    checked={pageTicked}
                    indeterminate={!pageTicked && ticked > 0}
                    onCheckedChange={() =>
                      ticked > 0
                        ? table.toggleAllRowsSelected(false, {
                            deselectAll: true,
                          })
                        : table.toggleAllPageRowsSelected(true)
                    }
                  />
                </TableHead>
              )}
              {group.headers.map((header) => (
                <SortableHead
                  key={header.id}
                  header={header}
                  table={table}
                  covered={ticked > 0}
                />
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
              className={cn(
                onRowClick && 'cursor-pointer',
                selectedRowId === row.id && 'bg-selected hover:bg-selected',
              )}
              onClick={(event) => {
                if (
                  !onRowClick ||
                  // A click in a menu opened from the row reaches it
                  // through React's portal, not the page.
                  !(event.target instanceof Node) ||
                  !event.currentTarget.contains(event.target) ||
                  (event.target instanceof Element &&
                    event.target.closest(
                      'a, button, input, [role="button"], [role="checkbox"]',
                    ))
                ) {
                  return
                }
                onRowClick(row.original)
              }}
            >
              {selectable && (
                <TableCell className="w-12 px-3">
                  <Checkbox
                    aria-label={messages.selectRow(
                      titleColumn
                        ? String(row.getValue(titleColumn.id))
                        : row.id,
                    )}
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onCheckedChange={(checked) => row.toggleSelected(checked)}
                  />
                </TableCell>
              )}
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      // A long e-mail breaks inside its column.
                      'px-3 py-2.5 break-words whitespace-normal',
                      meta?.title && 'font-medium text-fg',
                      meta?.muted && 'text-fg-muted',
                      meta?.amount && 'text-right tabular-nums',
                      meta?.hideBelow && hideBelowClasses[meta.hideBelow],
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
        {hasFooter && (
          <TableFooter>
            {table.getFooterGroups().map((group) => (
              <TableRow key={group.id}>
                {selectable && <TableCell />}
                {group.headers.map((footer) => {
                  const meta = footer.column.columnDef.meta
                  return (
                    <TableCell
                      key={footer.id}
                      className={cn(
                        'px-3 py-2',
                        meta?.amount && 'text-right tabular-nums',
                        meta?.hideBelow && hideBelowClasses[meta.hideBelow],
                      )}
                    >
                      {footer.isPlaceholder ? null : (
                        <table.FlexRender footer={footer} />
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableFooter>
        )}
      </Table>
    </div>
  )
}
