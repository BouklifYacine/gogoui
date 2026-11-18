import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { FilterLayoutContext } from './filter-layout.ts'

/**
 * One group's line in a list of filters. Its layout stays the same object
 * between renders, so the filters reading it redraw only when needed.
 */
export function FilterRowProvider({
  index,
  onOpen,
  sidebar,
  selected,
  showIcon,
  id,
  children,
}: {
  index: number
  /** Opens the group at this index: stable (useCallback or a setter). */
  onOpen: (index: number) => void
  sidebar?: boolean
  selected?: boolean
  showIcon?: boolean
  id?: string
  children: ReactNode
}) {
  const layout = useMemo(
    () => ({
      mode: 'row' as const,
      open: () => onOpen(index),
      sidebar,
      selected,
      showIcon,
      id,
    }),
    [index, onOpen, sidebar, selected, showIcon, id],
  )
  return <FilterLayoutContext value={layout}>{children}</FilterLayoutContext>
}
