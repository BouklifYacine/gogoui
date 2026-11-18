import type { ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'

import { useFilterLayout } from '../internal/filter-layout.ts'
import { FilterRow } from '../internal/filter-row.tsx'

type FilterSectionProps = {
  legend: string
  /** What is on, in words; null when nothing is. */
  summary: string | null
  icon: Icon
  children: ReactNode
}

/**
 * Several independent filters sharing one group of a `FilterMenu` (a few
 * `FilterCheckbox`).
 *
 * @summary Several filters in one group of the menu.
 */
function FilterSection({
  legend,
  summary,
  icon,
  children,
}: FilterSectionProps) {
  const layout = useFilterLayout()
  if (layout.mode === 'row') {
    return (
      <FilterRow
        label={legend}
        summary={summary}
        icon={icon}
        onOpen={layout.open}
      />
    )
  }

  return (
    <fieldset className="flex flex-col">
      <legend className="pb-1 font-medium">{legend}</legend>
      {children}
    </fieldset>
  )
}

export { FilterSection }
export type { FilterSectionProps }
