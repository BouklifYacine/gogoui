import type { ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'

import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useFilterLayout } from '../internal/filter-layout.ts'
import { FilterRow } from '../internal/filter-row.tsx'

/** The words FilterSection writes, to change on one section only. */
type FilterSectionLabels = Partial<Pick<GoGoUIMessages, 'activeSummary'>>

type FilterSectionProps = {
  legend: string
  /** What is on, in words; null when nothing is. */
  summary: string | null
  icon: Icon
  children: ReactNode
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: FilterSectionLabels
}

/**
 * Several filters in one group of the menu.
 *
 * **Key props**: `legend`, `icon`, `summary` (what is chosen, shown while
 * folded), children, `labels` to change its words.
 *
 * @summary Several filters in one group of the menu.
 */
function FilterSection({
  legend,
  summary,
  icon,
  children,
  labels,
}: FilterSectionProps) {
  const layout = useFilterLayout()
  if (layout.mode === 'row') {
    return (
      <FilterRow
        labels={labels}
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
export type { FilterSectionLabels, FilterSectionProps }
