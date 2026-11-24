import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { Button } from './button.tsx'

// « Tout sélectionner (N) » leaves once every row is ticked, while it
// still has the focus: the focus goes to the bar's count, read aloud,
// instead of falling to the page. A callback ref with a cleanup.
function keepFocusInBar(button: HTMLButtonElement | null) {
  const bar = button?.closest('section')
  return () => {
    if (button && document.activeElement === button) {
      requestAnimationFrame(() =>
        bar?.querySelector<HTMLElement>('[data-bulk-count]')?.focus(),
      )
    }
  }
}

/** The words BulkActionsBar writes, to change on one BulkActionsBar only. */
type BulkActionsBarLabels = Partial<
  Pick<GoGoUIMessages, 'selectedRows' | 'selecting'>
>

type BulkActionsBarProps = {
  /** « 3 clients sélectionnés ». */
  label: string
  /** The actions' buttons for the ticked rows. */
  actions?: ReactNode
  /** Every row the filters keep, beyond this page; absent: none to add. */
  selectAll?: { label: string; onSelect: () => void; loading?: boolean }
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: BulkActionsBarLabels
}

/**
 * The ticked rows' count and their actions.
 *
 * **Use it for** acting on several rows at once (archive, export).
 *
 * **Where**: in the table's head or right above it, only while rows are
 * ticked.
 *
 * **Key props**: `label` (« 3 demandes sélectionnées »), `actions`,
 * `selectAll` (offer every row of every page), `labels` to change its words.
 *
 * **Accessibility**: the count is read as it changes.
 *
 * @summary The ticked rows' count and actions.
 */
function BulkActionsBar({
  label,
  actions,
  selectAll,
  labels,
}: BulkActionsBarProps) {
  const messages = useGoGoUIMessages(labels)
  return (
    <section
      aria-label={messages.selectedRows}
      data-slot="bulk-actions-bar"
      // left-12: after the column of boxes. h-11: the head row's height.
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-selected px-3 py-2 @3xl:absolute @3xl:top-0 @3xl:right-0 @3xl:left-12 @3xl:z-10 @3xl:h-11 @3xl:flex-nowrap @3xl:rounded-none @3xl:rounded-tr-2xl @3xl:bg-card @3xl:py-0 @3xl:pe-5"
    >
      <p
        data-bulk-count
        tabIndex={-1}
        className="min-w-0 truncate text-sm font-medium text-fg outline-none"
      >
        {label}
      </p>
      {selectAll && (
        <Button
          ref={keepFocusInBar}
          variant="link"
          size="sm"
          className="shrink-0 px-0"
          loading={selectAll.loading}
          loadingText={messages.selecting}
          onClick={selectAll.onSelect}
        >
          {selectAll.label}
        </Button>
      )}
      <div className="ms-auto flex shrink-0 flex-wrap items-center gap-2 @3xl:flex-nowrap @3xl:gap-3 @3xl:*:h-7!">
        {actions}
      </div>
    </section>
  )
}

export { BulkActionsBar }
export type { BulkActionsBarProps, BulkActionsBarLabels }
