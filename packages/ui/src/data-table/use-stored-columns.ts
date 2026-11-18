import { useState } from 'react'
import { functionalUpdate } from '@tanstack/react-table'
import type { ColumnVisibilityState, OnChangeFn } from '@tanstack/react-table'

const storageKey = (list: string) => `gogoui:columns:${list}`

// The columns hidden on this device; nothing kept (a private window,
// blocked site data) means every column shows.
function read(list: string): ColumnVisibilityState {
  try {
    const stored = localStorage.getItem(storageKey(list))
    const parsed: unknown = stored ? JSON.parse(stored) : {}
    return parsed && typeof parsed === 'object'
      ? (parsed as ColumnVisibilityState)
      : {}
  } catch {
    return {}
  }
}

function write(list: string, columns: ColumnVisibilityState) {
  try {
    localStorage.setItem(storageKey(list), JSON.stringify(columns))
  } catch {
    // Not kept: the choice still holds until the page is left.
  }
}

/**
 * The columns a list shows, as chosen in « Colonnes », kept on this
 * device. Pass both to the table: `state: { columnVisibility }` and
 * `onColumnVisibilityChange`. Reads the browser's storage: render it in
 * the browser only.
 *
 * @param list The list's name in storage (« clients »).
 */
export function useStoredColumns(list: string) {
  const [columnVisibility, setColumnVisibility] = useState(() => read(list))

  const onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState> = (
    updater,
  ) => {
    const next = functionalUpdate(updater, columnVisibility)
    setColumnVisibility(next)
    write(list, next)
  }

  return { columnVisibility, onColumnVisibilityChange }
}
