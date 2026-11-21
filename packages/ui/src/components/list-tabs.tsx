import type { ReactNode } from 'react'

import { PillTabsList } from './pill-tabs-list.tsx'
import type { PillTab } from './pill-tabs-list.tsx'
import { Tabs, TabsContent } from './tabs.tsx'

type ListTabsProps<TValue extends string> = {
  /** What the tabs choose, for a screen reader (« Clients à afficher »). */
  label: string
  tabs: PillTab<TValue>[]
  value: TValue
  onValueChange: (value: TValue) => void
  /** On the tabs' line, after them: a search, a filter button. */
  toolbar?: ReactNode
  children: ReactNode
}

/**
 * Tabs over one list, each showing another set of rows.
 *
 * **Use it for** « À traiter | En cours | Archivées » on a list page.
 *
 * **Key props**: `label`, `tabs` (`{ value, label, count? }[]`), `value` +
 * `onValueChange`, `toolbar` (a search or a filter on the same line),
 * children (the list).
 *
 * @summary Tabs that switch the rows of one list.
 */
function ListTabs<TValue extends string>({
  label,
  tabs,
  value,
  onValueChange,
  toolbar,
  children,
}: ListTabsProps<TValue>) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as TValue)}
      className="gap-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="-mx-1 max-w-full min-w-0 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <PillTabsList label={label} tabs={tabs} value={value} />
        </div>
        {toolbar}
      </div>
      <TabsContent value={value} className="flex flex-col gap-6 text-base">
        {children}
      </TabsContent>
    </Tabs>
  )
}

export { ListTabs }
export type { ListTabsProps }
