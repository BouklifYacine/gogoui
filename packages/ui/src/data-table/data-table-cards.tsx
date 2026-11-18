import { Fragment } from 'react'

import { cn } from '../lib/cn.ts'
import { LabelledValue } from './labelled-value.tsx'
import type { DataTableInstance } from './table-hook.ts'

/**
 * The same rows on a phone: one dense line per record, as in a phone's
 * own lists. The name in bold, the other columns in a quieter line under
 * it, `phoneTrailing` ones on the right, the buttons last; a lone « … »
 * menu (`phoneInline`) at the end of the name's line.
 */
export function DataTableCards<TData extends { id: string }>({
  table,
  caption,
  selectedRowId,
}: {
  table: DataTableInstance<TData>
  caption: string
  selectedRowId?: string | null
}) {
  return (
    <ul
      aria-label={caption}
      className="flex flex-col divide-y divide-line rounded-2xl bg-card shadow-sm"
    >
      {table.getRowModel().rows.map((row) => {
        const cells = row
          .getVisibleCells()
          .filter((cell) => !cell.column.columnDef.meta?.phoneHidden)
        const title = cells.find((cell) => cell.column.columnDef.meta?.title)
        const actions = cells.find(
          (cell) => cell.column.columnDef.meta?.actions,
        )
        const rest = cells.filter((cell) => cell !== title && cell !== actions)
        const trailing = rest.filter(
          (cell) => cell.column.columnDef.meta?.phoneTrailing,
        )
        const details = rest.filter((cell) => !trailing.includes(cell))
        const inline = actions?.column.columnDef.meta?.phoneInline
        return (
          <li
            key={row.id}
            // Relative: the name's link may stretch over the whole line.
            className={cn(
              'relative flex flex-col gap-3 px-4 py-3',
              selectedRowId === row.id && 'bg-selected',
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {title && (
                  <div className="font-medium text-fg [overflow-wrap:anywhere]">
                    <table.FlexRender cell={title} />
                  </div>
                )}
                {details.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-fg-muted">
                    {details.map((cell, index) => (
                      <Fragment key={cell.id}>
                        {index > 0 && <span aria-hidden="true">·</span>}
                        <LabelledValue table={table} cell={cell} />
                      </Fragment>
                    ))}
                  </div>
                )}
              </div>
              {trailing.length > 0 && (
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  {trailing.map((cell) => (
                    <LabelledValue key={cell.id} table={table} cell={cell} />
                  ))}
                </div>
              )}
              {actions && inline && (
                <div className="relative z-10 -my-1.5 -me-2 shrink-0">
                  <table.FlexRender cell={actions} />
                </div>
              )}
            </div>
            {actions && !inline && (
              // On a phone line the buttons take the full 44 px.
              <div className="flex flex-wrap gap-2 [&_[data-slot=button]]:h-11">
                <table.FlexRender cell={actions} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
