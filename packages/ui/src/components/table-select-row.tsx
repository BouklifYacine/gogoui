import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { cn } from '../lib/cn.ts'
import { Checkbox } from './checkbox.tsx'
import { TableCell } from './table.tsx'

/** The words TableSelectRow writes, to change on one TableSelectRow only. */
type TableSelectRowLabels = Partial<Pick<GoGoUIMessages, 'selectRow'>>

type TableSelectRowProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** The row's name, for a screen reader: « Sélectionner Julie Martin ». */
  name: string
  /** A row no bulk action applies to. */
  disabled?: boolean
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: TableSelectRowLabels
}

/**
 * A row's box to tick.
 *
 * **Key props**: `checked`, `onCheckedChange`, `name` (the row's name, read
 * as « Sélectionner Grange »), `disabled`, `labels` to change its words.
 *
 * **Accessibility**: each box is named by its row, never « Sélectionner »
 * alone.
 *
 * @summary A row's box to tick.
 */
function TableSelectRow({
  checked,
  onCheckedChange,
  name,
  disabled,
  className,
  labels,
}: TableSelectRowProps) {
  const { selectRow } = useGoGoUIMessages(labels)
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
export type { TableSelectRowProps, TableSelectRowLabels }
