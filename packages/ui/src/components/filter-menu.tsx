import { Children, isValidElement, useCallback, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { CaretLeftIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { PHONE_QUERY } from '../internal/breakpoint.ts'
import { FilterLayoutContext, PANEL_LAYOUT } from '../internal/filter-layout.ts'
import { FilterRowProvider } from '../internal/filter-row-provider.tsx'
import { FilterTriggerLabel } from '../internal/filter-trigger-label.tsx'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from './popover.tsx'

// Shows the other side of the phone's sheet at once and moves the focus
// there before the button pressed disappears: otherwise the popover, seeing
// its focus lost, takes it back a frame later.
function swapThenFocus(swap: () => void, id: string) {
  flushSync(swap)
  document.getElementById(id)?.focus()
}

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
 * **Use it for** three filters or more.
 *
 * **Where**: in the list's toolbar, beside the search. On a computer, a
 * popover: the groups in a sidebar, the chosen group's controls beside it.
 * On a phone (under 768px), the same popover rises from the screen's
 * bottom edge: one line per group with what is chosen, then one group at a
 * time, « Voir les résultats » closing it on the filtered list.
 *
 * **Key props**: `activeCount` (shown on the button), `onReset`, `title`,
 * children (`FilterSection`s, `FilterCheckbox`, ranges),
 * `labels` to change its words.
 *
 * **Accessibility**: the count is in the button's name. On a phone the
 * focus stays in the sheet while it is open, goes to « Tous les filtres »
 * when a group opens and back to its line when it closes.
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
  // The group shown: beside the sidebar on a computer, alone on a phone.
  const [active, setActive] = useState(0)
  // On a phone, whether that group is open; the list of groups otherwise.
  const [drilled, setDrilled] = useState(false)
  // Opened on a phone, the sheet keeps the focus, as a drawer does.
  const [trapFocus, setTrapFocus] = useState(false)
  const rowId = useId()
  const backId = `${rowId}-back`
  const groups = Children.toArray(children)
  const grouped = groups.length > 1
  const compact = groups.length <= 3
  const openGroup = useCallback(
    (index: number) => {
      swapThenFocus(() => {
        setActive(index)
        setDrilled(true)
      }, backId)
    },
    [backId],
  )

  // A phone's list: one line per group with what is chosen.
  const phoneList = (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto px-4 text-sm md:hidden',
        drilled && 'hidden',
      )}
    >
      {groups.map((group, index) => (
        <div
          key={isValidElement(group) ? group.key : index}
          className={cn('py-1', index > 0 && 'border-t border-line')}
        >
          <FilterRowProvider
            index={index}
            onOpen={openGroup}
            showIcon={grouped}
            id={`${rowId}-${index}`}
          >
            {group}
          </FilterRowProvider>
        </div>
      ))}
    </div>
  )

  return (
    <Popover
      modal={trapFocus}
      onOpenChange={(open) => {
        if (open) {
          // Read as it opens, never while drawing: the server has no screen.
          setTrapFocus(window.matchMedia(PHONE_QUERY).matches)
          return
        }
        // Opened again, it starts from the first group, or the list.
        setActive(0)
        setDrilled(false)
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
          'max-h-[70vh] gap-0 overflow-hidden p-0 text-base max-md:pb-0',
          grouped
            ? compact
              ? 'w-[min(43rem,calc(100vw-2rem))]'
              : 'w-[min(47.5rem,calc(100vw-2rem))]'
            : 'w-[min(27.5rem,calc(100vw-2rem))]',
        )}
      >
        {/* On a phone, the sheet's head: its title, or the way back to the
            list while a group is open. Read only on a computer. */}
        <div className="flex shrink-0 items-center gap-1 px-4 pt-4 pb-2 md:contents">
          {drilled && (
            <Button
              id={backId}
              variant="ghost"
              size="sm"
              className="-ml-2 md:hidden"
              onClick={() => {
                swapThenFocus(
                  () => setDrilled(false),
                  `${rowId}-${String(active)}`,
                )
              }}
            >
              <CaretLeftIcon aria-hidden="true" />
              {messages.allFilters}
            </Button>
          )}
          <PopoverTitle
            className={cn(
              'text-xl font-medium md:sr-only',
              drilled && 'sr-only',
            )}
          >
            {title}
          </PopoverTitle>
        </div>

        {grouped ? (
          <div className="flex min-h-0 overflow-hidden max-md:flex-1">
            <nav
              aria-label={messages.filterCategories}
              className={cn(
                'shrink-0 overflow-y-auto border-r border-line bg-tray p-3 max-md:hidden',
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
            {phoneList}
            {/* One full column: a group sized by its container (@container)
                gives the grid no width of its own. */}
            <div
              className={cn(
                'grid min-w-0 flex-1 overflow-y-auto p-6 max-md:px-4 max-md:py-2 max-md:text-sm',
                !drilled && 'max-md:hidden',
              )}
              style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
            >
              {/* The groups overlap in one cell, keep their state and
                  reserve room for the tallest one, so the panel does not
                  jump. On a phone, the open one alone. */}
              {groups.map((group, index) => (
                <div
                  key={isValidElement(group) ? group.key : index}
                  style={{ gridArea: '1 / 1' }}
                  className={cn(active !== index && 'invisible max-md:hidden')}
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
          <>
            {phoneList}
            <div
              className={cn(
                'min-h-0 overflow-y-auto px-4 py-4 max-md:flex-1 max-md:py-2 max-md:text-sm',
                !drilled && 'max-md:hidden',
              )}
            >
              {children}
            </div>
          </>
        )}

        {/* Always there, so the foot never jumps: off until a filter is on. */}
        <div className="flex justify-end border-t border-line p-3 max-md:hidden">
          <Button
            variant="outline"
            size="sm"
            disabled={activeCount === 0}
            onClick={onReset}
          >
            {messages.resetAllFilters}
          </Button>
        </div>
        {/* A phone's foot: start again, or close on the filtered list. */}
        <div className="flex shrink-0 gap-2 border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden">
          <Button
            variant="outline"
            className="flex-1"
            disabled={activeCount === 0}
            onClick={onReset}
          >
            {messages.resetFilters}
          </Button>
          <PopoverPrimitive.Close render={<Button className="flex-1" />}>
            {messages.seeResults}
          </PopoverPrimitive.Close>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { FilterMenu }
export type { FilterMenuProps, FilterMenuLabels }
