import { GoGoIcon } from '../internal/gogo-icon.tsx'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { RowActionItem } from '../internal/row-action-item.tsx'
import type { RowAction } from '../internal/row-action-item.tsx'
import { Button } from './button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'

type RowActionsMenuProps = {
  /** What the row is called, for a screen reader (« Actions « Grange » »). */
  name: string
  actions: RowAction[]
  /** While an action runs (« Archivage… »): the button spins and says it. */
  pending?: string
}

/**
 * The « … » button at the end of a table row, opening its actions: one
 * button per row instead of three. Destructive actions come last, apart,
 * in red; they should open a `ConfirmDialog` rather than act at once.
 * 44 px under a finger, 32 px with a mouse.
 *
 * @summary The « … » menu of a table row's actions.
 */
function RowActionsMenu({ name, actions, pending }: RowActionsMenuProps) {
  const { rowActions } = useGoGoUIMessages()
  const kept = actions.filter((action) => !action.destructive)
  const destructive = actions.filter((action) => action.destructive)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-11 rounded-lg text-fg-muted md:size-8"
            loading={pending !== undefined}
          />
        }
      >
        {pending === undefined && (
          <GoGoIcon name="more" aria-hidden="true" className="size-4.5" />
        )}
        <span className="sr-only">{pending ?? rowActions(name)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {kept.map((action) => (
          <RowActionItem key={action.label} action={action} />
        ))}
        {destructive.length > 0 && kept.length > 0 && <DropdownMenuSeparator />}
        {destructive.map((action) => (
          <RowActionItem key={action.label} action={action} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { RowActionsMenu }
export type { RowAction, RowActionsMenuProps }
