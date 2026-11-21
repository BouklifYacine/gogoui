import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { Checkbox } from './checkbox.tsx'
import { TableHead } from './table.tsx'

type TableSelectAllProps = {
  /** All rows of the page ticked (true), some (« some »), or none. */
  checked: boolean | 'some'
  /**
   * Called with what the box asks for: tick the page (true), or untick
   * everything (false, the way out of a selection).
   */
  onCheckedChange: (checked: boolean) => void
  /** Its name for a screen reader, « Sélectionner toutes les lignes… » by default. */
  label?: string
  className?: string
}

/**
 * The head row's box that ticks a page of rows.
 *
 * **Use it for** a `Table` with ticked rows; pair with `TableSelectRow`.
 *
 * **States**: none, some (indeterminate), all.
 *
 * **Key props**: `checked` (true, false or `'some'`),
 * `onCheckedChange`, `label`.
 *
 * @summary The head row's box that ticks a page of rows.
 */
function TableSelectAll({
  checked,
  onCheckedChange,
  label,
  className,
}: TableSelectAllProps) {
  const { selectPage } = useGoGoUIMessages()
  return (
    <TableHead
      data-slot="table-select-all"
      className={cn('w-12 px-3', className)}
    >
      <Checkbox
        aria-label={label ?? selectPage}
        checked={checked === true}
        indeterminate={checked === 'some'}
        onCheckedChange={() => onCheckedChange(checked === false)}
      />
    </TableHead>
  )
}

export { TableSelectAll }
export type { TableSelectAllProps }
