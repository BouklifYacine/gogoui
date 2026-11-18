import { createContext, use } from 'react'

/**
 * How a filter shows itself: a line in the list of groups, or the group's
 * controls. The desktop sidebar also says which group is open.
 */
export type FilterLayout =
  | { mode: 'full'; panel?: boolean }
  | {
      mode: 'row'
      open: () => void
      sidebar?: boolean
      selected?: boolean
      showIcon?: boolean
      id?: string
    }

export const FilterLayoutContext = createContext<FilterLayout>({ mode: 'full' })

// The same two objects every time: the filters never redraw for nothing.
export const PANEL_LAYOUT: FilterLayout = { mode: 'full', panel: true }
export const PLAIN_LAYOUT: FilterLayout = { mode: 'full', panel: false }

export function useFilterLayout(): FilterLayout {
  return use(FilterLayoutContext)
}
