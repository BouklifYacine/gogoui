import type { Icon } from '@phosphor-icons/react'

import { DropdownMenuItem } from '../components/dropdown-menu.tsx'

export type RowAction = {
  label: string
  icon?: Icon
  /** Deletes or stops something: shown last, apart, in red. */
  destructive?: boolean
  onSelect: () => void
  disabled?: boolean
}

/** One line of a row's « … » menu. */
export function RowActionItem({ action }: { action: RowAction }) {
  const ActionIcon = action.icon
  return (
    <DropdownMenuItem
      disabled={action.disabled}
      onClick={action.onSelect}
      variant={action.destructive ? 'destructive' : 'default'}
      className="gap-3"
    >
      {ActionIcon && (
        <ActionIcon aria-hidden="true" className="size-4 shrink-0" />
      )}
      {action.label}
    </DropdownMenuItem>
  )
}
