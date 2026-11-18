import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { Checkbox } from './checkbox.tsx'
import { TableCell } from './table.tsx'

type TableSelectRowProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** The row's name, for a screen reader: « Sélectionner Julie Martin ». */
  name: string
  /** A row no bulk action applies to. */
  disabled?: boolean
  className?: string
}

/**
 * A row's box to tick, first cell of the row. Put `data-state="selected"`
 * on the `TableRow` when it is ticked, so the row shows it. It holds no
 * selection: your code keeps it.
 *
 * @summary A row's box to tick.
 */
function TableSelectRow({
  checked,
  onCheckedChange,
  name,
  disabled,
  className,
}: TableSelectRowProps) {
  const { selectRow } = useGoGoUIMessages()
  return (
    <TableCell
      data-slot="table-select-row"
      className={cn('w-12 px-3', className)}
    >
      <Checkbox
        aria-label={selectRow(name)}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </TableCell>
  )
}

export { TableSelectRow }
export type { TableSelectRowProps }
