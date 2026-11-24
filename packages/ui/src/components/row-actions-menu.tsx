import { GoGoIcon } from '../internal/gogo-icon.tsx'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { RowActionItem } from '../internal/row-action-item.tsx'
import type { RowAction } from '../internal/row-action-item.tsx'
import { Button } from './button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'

/** The words RowActionsMenu writes, to change on one RowActionsMenu only. */
type RowActionsMenuLabels = Partial<Pick<GoGoUIMessages, 'rowActions'>>

type RowActionsMenuProps = {
  /** What the row is called, for a screen reader (« Actions « Grange » »). */
  name: string
  actions: RowAction[]
  /** While an action runs (« Archivage… »): the button spins and says it. */
  pending?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: RowActionsMenuLabels
}

/**
 * The « … » menu of a table row's actions.
 *
 * **Use it for** two or more actions on a row; one button per row instead
 * of three. Destructive ones come last, in red, and open a
 * `ConfirmDialog`.
 *
 * **Where**: the last cell of the row, aligned right.
 *
 * **States**: closed, open, an action running (`pending`: spins and says
 * it).
 *
 * **Key props**: `name` (the row's name for screen readers), `actions`
 * (`{ label, onSelect, icon?, destructive?, disabled? }`), `pending`,
 * `labels` to change its words.
 *
 * @summary The « … » menu of a table row's actions.
 */
function RowActionsMenu({
  name,
  actions,
  pending,
  labels,
}: RowActionsMenuProps) {
  const { rowActions } = useGoGoUIMessages(labels)
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
export type { RowAction, RowActionsMenuProps, RowActionsMenuLabels }
