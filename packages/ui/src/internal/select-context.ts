import { createContext } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { Select as SelectPrimitive } from '@base-ui/react/select'

type Items = SelectPrimitive.Root.Props<unknown>['items']

/**
 * What a Select's parts share beyond Base UI's own state: where each value
 * sits in the list (so the trigger's value rolls the right way), each
 * value's words (for the chips of a multiple Select), the row a value was
 * just picked from (so a morph Select's label flies from it), and the
 * actions that close the list.
 */
export type SelectShared = {
  items: Items
  itemToStringLabel: ((value: unknown) => string) | undefined
  /** Each value's place among the rows, read when the list shows. */
  order: Map<unknown, number>
  /** Each value's words, read from its row when the list shows. */
  labels: Map<unknown, string>
  /** The trigger's placeholder, for the morph list's lid. */
  placeholder: ReactNode
  setPlaceholder: (placeholder: ReactNode) => void
  /** Where the label of the value just picked sat, from the lid's slot. */
  pick: SelectPick | null
  setPick: (pick: SelectPick) => void
  actionsRef: RefObject<SelectPrimitive.Root.Actions | null>
}

export type SelectPick = { value: unknown; x: number; y: number }

export const SelectSharedContext = createContext<SelectShared | null>(null)

type Leaf = { value: unknown; label: ReactNode }

function leaves(items: Items): readonly Leaf[] | null {
  if (!Array.isArray(items)) {
    return null
  }
  return (items as readonly unknown[]).flatMap((item) => {
    if (item && typeof item === 'object' && 'items' in item) {
      return (item as { items: readonly Leaf[] }).items
    }
    return [item as Leaf]
  })
}

/** A value's place in the list: in `items` when given, else among the rows. */
export function indexOfValue(shared: SelectShared | null, value: unknown) {
  if (!shared || value == null) {
    return -1
  }
  const list = leaves(shared.items)
  if (list) {
    return list.findIndex((item) => Object.is(item.value, value))
  }
  if (shared.items && typeof shared.items === 'object') {
    return Object.keys(shared.items).indexOf(String(value))
  }
  return shared.order.get(value) ?? -1
}

/** A value's words: from `items`, `itemToStringLabel`, its row, or itself. */
export function labelOfValue(
  shared: SelectShared | null,
  value: unknown,
): ReactNode {
  if (shared) {
    const list = leaves(shared.items)
    const found = list?.find((item) => Object.is(item.value, value))
    if (found) {
      return found.label
    }
    if (!list && shared.items && typeof shared.items === 'object') {
      const label = (shared.items as Record<string, ReactNode>)[String(value)]
      if (label !== undefined) {
        return label
      }
    }
    if (shared.itemToStringLabel) {
      return shared.itemToStringLabel(value)
    }
    const read = shared.labels.get(value)
    if (read !== undefined) {
      return read
    }
  }
  return String(value)
}
