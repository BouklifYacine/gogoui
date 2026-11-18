import { Children, isValidElement, useCallback, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { CaretLeftIcon } from '@phosphor-icons/react'

import { Button } from '../components/button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../components/drawer.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import {
  FilterLayoutContext,
  PANEL_LAYOUT,
  PLAIN_LAYOUT,
} from './filter-layout.ts'
import { FilterRowProvider } from './filter-row-provider.tsx'
import { FilterTriggerLabel } from './filter-trigger-label.tsx'

// Once the screen has been redrawn.
function focusSoon(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus())
}

/**
 * A list's filters on a phone, in a drawer from the bottom: one line per
 * group with what is chosen, then one group at a time. « Voir les
 * résultats » closes it on the filtered list.
 */
export function FilterDrawer({
  title,
  activeCount,
  onReset,
  children,
}: {
  title: string
  activeCount: number
  onReset: () => void
  children: ReactNode
}) {
  const messages = useGoGoUIMessages()
  // The group open alone, by its place; null: the list.
  const [active, setActive] = useState<number | null>(null)
  const rowId = useId()
  const backId = `${rowId}-back`
  const groups = Children.toArray(children)
  const shown = active === null ? null : groups[active]
  const openGroup = useCallback(
    (index: number) => {
      setActive(index)
      focusSoon(backId)
    },
    [backId],
  )

  return (
    <Drawer
      showSwipeHandle
      // Opened again, it starts from the list.
      onOpenChange={(open) => {
        if (!open) setActive(null)
      }}
    >
      <DrawerTrigger
        render={<Button variant="outline" size="sm" className="shrink-0" />}
      >
        <FilterTriggerLabel activeCount={activeCount} />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center gap-1 pb-2 text-left">
          {shown !== null && shown !== undefined && (
            <Button
              id={backId}
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() => {
                setActive(null)
                focusSoon(`${rowId}-${String(active)}`)
              }}
            >
              <CaretLeftIcon aria-hidden="true" />
              {messages.allFilters}
            </Button>
          )}
          <DrawerTitle
            className={cn('text-xl font-medium', shown != null && 'sr-only')}
          >
            {title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {shown == null ? (
            groups.map((group, index) => (
              <div
                key={isValidElement(group) ? group.key : index}
                className={cn('py-1', index > 0 && 'border-t border-line')}
              >
                <FilterRowProvider
                  index={index}
                  onOpen={openGroup}
                  showIcon={groups.length > 1}
                  id={`${rowId}-${index}`}
                >
                  {group}
                </FilterRowProvider>
              </div>
            ))
          ) : (
            <div className="py-2">
              <FilterLayoutContext
                value={groups.length > 1 ? PANEL_LAYOUT : PLAIN_LAYOUT}
              >
                {shown}
              </FilterLayoutContext>
            </div>
          )}
        </div>

        <DrawerFooter className="flex-row border-t border-line pt-4">
          <Button
            variant="outline"
            className="flex-1"
            disabled={activeCount === 0}
            onClick={onReset}
          >
            {messages.resetFilters}
          </Button>
          <DrawerClose render={<Button className="flex-1" />}>
            {messages.seeResults}
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
