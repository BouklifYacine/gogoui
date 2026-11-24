import { useId, useState } from 'react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
} from '@phosphor-icons/react'

import { Button } from '../components/button.tsx'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../components/drawer.tsx'
import { RadioGroup, RadioGroupItem } from '../components/radio-group.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { columnLabel } from './hideable-columns.ts'
import type { DataTableInstance } from './table-hook.ts'

/**
 * A list's order on a phone, where headers do not fit: a chip saying the
 * order in use, opening a drawer with every order a tap away.
 */
export function SortChip<TData extends { id: string }>({
  table,
  className,
}: {
  table: DataTableInstance<TData>
  /** On the chip: `md:hidden` keeps it to a phone. */
  className?: string
}) {
  const messages = useGoGoUIMessages()
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const sortable = table
    .getAllLeafColumns()
    .filter((column) => column.getCanSort())
  if (sortable.length === 0) {
    return null
  }
  const [sorting] = table.state.sorting
  const current = sortable.find((column) => column.id === sorting?.id)
  const value = sorting ? `${sorting.id}:${sorting.desc ? 'desc' : 'asc'}` : ''
  const options = sortable.flatMap((column) => [
    {
      value: `${column.id}:asc`,
      label: `${columnLabel(column)}, ${messages.ascending}`,
    },
    {
      value: `${column.id}:desc`,
      label: `${columnLabel(column)}, ${messages.descending}`,
    },
  ])

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn('shrink-0 rounded-full', className)}
            aria-label={
              current && sorting
                ? messages.sortedBy(
                    columnLabel(current),
                    sorting.desc ? messages.descending : messages.ascending,
                  )
                : undefined
            }
          />
        }
      >
        {current && sorting ? (
          <>
            {columnLabel(current)}
            {sorting.desc ? (
              <ArrowDownIcon aria-hidden="true" />
            ) : (
              <ArrowUpIcon aria-hidden="true" />
            )}
          </>
        ) : (
          <>
            <ArrowsDownUpIcon aria-hidden="true" />
            {messages.sort}
          </>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle id={titleId} className="text-xl font-medium">
            {messages.sortBy}
          </DrawerTitle>
        </DrawerHeader>
        <RadioGroup
          aria-labelledby={titleId}
          value={value}
          onValueChange={(next) => {
            const [id = '', direction] = String(next).split(':')
            table.setSorting([{ id, desc: direction === 'desc' }])
            setOpen(false)
          }}
          className="min-h-0 flex-1 gap-0 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          {options.map((option, index) => (
            // The whole line is the radio's label: a big target.
            <label
              key={option.value}
              className={cn(
                'flex min-h-12 items-center justify-between gap-3',
                index > 0 && 'border-t border-line',
              )}
            >
              {option.label}
              <RadioGroupItem value={option.value} />
            </label>
          ))}
        </RadioGroup>
      </DrawerContent>
    </Drawer>
  )
}
