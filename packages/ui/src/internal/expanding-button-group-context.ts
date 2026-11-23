import { createContext, useContext } from 'react'
import type { FocusEvent, PointerEvent } from 'react'

/** What an ExpandingButtonGroupItem tells its group when it is used. */
export type ExpandingAction = {
  value: string
  disabled?: boolean
  doneLabel?: string
  onClick?: () => void | boolean | Promise<void | boolean>
}

type ExpandingButtonGroupState = {
  size: 'sm' | 'default'
  /** The buttons' geometry in px: closed width, icon, inset, gap, end. */
  geometry: {
    height: number
    icon: number
    start: number
    gap: number
    end: number
  }
  /** The action showing its label. */
  expanded: string | null
  /** The action Tab lands on. */
  tabStop: string | null
  /** The action confirming (« Archivé »), and its run, to draw the tick again. */
  done: { value: string; run: number } | null
  /** The action waiting for its promise. */
  busy: string | null
  onItemPointerDown: (
    value: string,
    event: PointerEvent<HTMLButtonElement>,
  ) => void
  onItemClick: (action: ExpandingAction) => void
  onItemFocus: (value: string, event: FocusEvent<HTMLButtonElement>) => void
}

export const ExpandingButtonGroupContext =
  createContext<ExpandingButtonGroupState | null>(null)

/** The group an item sits in; an item alone has none. */
export function useExpandingButtonGroup(): ExpandingButtonGroupState {
  const group = useContext(ExpandingButtonGroupContext)
  if (!group) {
    throw new Error(
      'ExpandingButtonGroupItem must sit inside an ExpandingButtonGroup.',
    )
  }
  return group
}
