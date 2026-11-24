import { Children, isValidElement, useState } from 'react'
import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { FilterDrawer } from '../internal/filter-drawer.tsx'
import { FilterLayoutContext, PANEL_LAYOUT } from '../internal/filter-layout.ts'
import { FilterRowProvider } from '../internal/filter-row-provider.tsx'
import { FilterTriggerLabel } from '../internal/filter-trigger-label.tsx'
import { useIsMobile } from '../internal/use-is-mobile.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from './popover.tsx'

/** The words FilterMenu writes, to change on one FilterMenu only. */
type FilterMenuLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'filterCategories'
    | 'resetAllFilters'
    | 'allFilters'
    | 'resetFilters'
    | 'seeResults'
    | 'filter'
    | 'activeFilterCount'
  >
>

type FilterMenuProps = {
  /** The menu's name, for screen readers: « Filtrer les clients ». */
  title: string
  /** How many filters are on, beside « Filtrer ». */
  activeCount: number
  onReset: () => void
  /** The groups: FilterCheckboxGroup, FilterDateRange, FilterNumberRange… */
  children: ReactNode
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: FilterMenuLabels
}

/**
 * A list's filters behind one « Filtrer » button.
 *
 * **Use it for** three filters or more; a popover on a computer, a bottom
 * panel on a phone.
 *
 * **Where**: in the list's toolbar, beside the search.
 *
 * **Key props**: `activeCount` (shown on the button), `onReset`, `title`,
 * children (`FilterSection`s, `FilterCheckbox`, ranges),
 * `labels` to change its words.
 *
 * **Accessibility**: the count is in the button's name.
 *
 * @summary A list's filters behind one « Filtrer » button.
 */
function FilterMenu({
  title,
  activeCount,
  onReset,
  children,
  labels,
}: FilterMenuProps) {
  const messages = useGoGoUIMessages(labels)
  const isMobile = useIsMobile()
  const [active, setActive] = useState(0)
  const groups = Children.toArray(children)
  const grouped = groups.length > 1
  const compact = groups.length <= 3

  if (isMobile) {
    return (
      <FilterDrawer
        title={title}
        activeCount={activeCount}
        onReset={onReset}
        labels={labels}
      >
        {children}
      </FilterDrawer>
    )
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) setActive(0)
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" size="sm" className="shrink-0" />}
      >
        <FilterTriggerLabel activeCount={activeCount} labels={labels} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn(
          'max-h-[70vh] gap-0 overflow-hidden p-0 text-base',
          grouped
            ? compact
              ? 'w-[min(43rem,calc(100vw-2rem))]'
              : 'w-[min(47.5rem,calc(100vw-2rem))]'
            : 'w-[min(27.5rem,calc(100vw-2rem))]',
        )}
      >
        <PopoverTitle className="sr-only">{title}</PopoverTitle>
        {grouped ? (
          <div className="flex min-h-0 overflow-hidden">
            <nav
              aria-label={messages.filterCategories}
              className={cn(
                'shrink-0 overflow-y-auto border-r border-line bg-tray p-3',
                compact ? 'w-56' : 'w-[17.5rem]',
              )}
            >
              {groups.map((group, index) => (
                <FilterRowProvider
                  key={isValidElement(group) ? group.key : index}
                  index={index}
                  onOpen={setActive}
                  sidebar
                  selected={active === index}
                  showIcon
                >
                  {group}
                </FilterRowProvider>
              ))}
            </nav>
            {/* One full column: a group sized by its container (@container)
                gives the grid no width of its own. */}
            <div
              className="grid min-w-0 flex-1 overflow-y-auto p-6"
              style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
            >
              {/* The groups overlap in one cell, keep their state and
                  reserve room for the tallest one, so the panel does not
                  jump. */}
              {groups.map((group, index) => (
                <div
                  key={isValidElement(group) ? group.key : index}
                  style={{ gridArea: '1 / 1' }}
                  className={cn(active !== index && 'invisible')}
                  aria-hidden={active !== index || undefined}
                  inert={active !== index || undefined}
                >
                  <FilterLayoutContext value={PANEL_LAYOUT}>
                    {group}
                  </FilterLayoutContext>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-0 overflow-y-auto px-4 py-4">{children}</div>
        )}
        {/* Always there, so the foot never jumps: off until a filter is on. */}
        <div className="flex justify-end border-t border-line p-3">
          <Button
            variant="outline"
            size="sm"
            disabled={activeCount === 0}
            onClick={onReset}
          >
            {messages.resetAllFilters}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { FilterMenu }
export type { FilterMenuProps, FilterMenuLabels }
