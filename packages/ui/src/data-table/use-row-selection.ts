import { useState } from 'react'
import { functionalUpdate } from '@tanstack/react-table'
import type { OnChangeFn, RowSelectionState } from '@tanstack/react-table'

/**
 * The rows ticked on a list, by id, kept across its pages and forgotten
 * when the list itself changes (another tab, filter or search): an action
 * must never reach rows no longer in sight. No effect resets it: the
 * selection remembers the list it was made on (`scope`) and reads as
 * empty on another one. Pass both to the table: `state: { rowSelection }`
 * and `onRowSelectionChange`.
 *
 * @param scope What makes the list, as text (its tab, filters, search).
 */
export function useRowSelection(scope: string) {
  const [selection, setSelection] = useState<{
    scope: string
    rows: RowSelectionState
  }>({ scope, rows: {} })
  const rowSelection = selection.scope === scope ? selection.rows : {}

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) =>
    setSelection({ scope, rows: functionalUpdate(updater, rowSelection) })

  return {
    rowSelection,
    onRowSelectionChange,
    /** The ids ticked, for the bulk action. */
    selectedIds: Object.keys(rowSelection).filter((id) => rowSelection[id]),
    /** Ticks these rows, the ones of other pages included. */
    select: (ids: string[]) =>
      setSelection({
        scope,
        rows: Object.fromEntries(ids.map((id) => [id, true])),
      }),
    clear: () => setSelection({ scope, rows: {} }),
  }
}
