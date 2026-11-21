import { ColumnsIcon } from '@phosphor-icons/react'

import { Badge } from '../components/badge.tsx'
import { Button } from '../components/button.tsx'
import { Checkbox } from '../components/checkbox.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '../components/popover.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { columnLabel, hideableColumns } from './hideable-columns.ts'
import type { DataTableInstance } from './table-hook.ts'

/**
 * The « Colonnes » menu that shows or hides a list's columns.
 *
 * **Use it for** wide lists; `DataTable` shows it with `columnsMenu`.
 * `useStoredColumns` remembers the choice.
 *
 * **Key props**: `table`.
 *
 * @summary The menu that hides a list's columns.
 */
export function DataTableColumnsMenu<TData extends { id: string }>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const messages = useGoGoUIMessages()
  const columns = hideableColumns(table)
  if (columns.length < 2) {
    return null
  }
  const hidden = columns.filter((column) => !column.getIsVisible()).length

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" size="sm" className="shrink-0" />}
      >
        <ColumnsIcon aria-hidden="true" />
        {messages.columns}
        {hidden > 0 && (
          <>
            <Badge aria-hidden="true" variant="secondary">
              {columns.length - hidden}/{columns.length}
            </Badge>
            <span className="sr-only">{messages.hiddenColumns(hidden)}</span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-[min(18rem,calc(100vw-2rem))] flex-col gap-2 text-base"
      >
        <PopoverTitle className="sr-only">
          {messages.columnsToShow}
        </PopoverTitle>
        <fieldset className="flex flex-col">
          <legend className="pb-1 font-medium">{messages.columnsToShow}</legend>
          {columns.map((column) => (
            <label
              key={column.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 hover:bg-hover"
            >
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
              />
              {columnLabel(column)}
            </label>
          ))}
        </fieldset>
        {hidden > 0 && (
          <Button
            variant="link"
            className="w-fit px-0"
            onClick={() => table.toggleAllColumnsVisible(true)}
          >
            {messages.showAllColumns}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
