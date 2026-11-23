import type { KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useFileUpload } from '../internal/file-upload-context.ts'
import { spring, stagger } from '../internal/motion.ts'
import { cn } from '../lib/cn.ts'
import { FileUploadItem } from './file-upload-item.tsx'

type FileUploadListProps = {
  className?: string
}

/**
 * The files of a `FileUpload`, one row each. A new batch drops in one row
 * after another (56ms apart, seven at most). The arrows move between rows
 * on the same button, Delete or Backspace removes the row in focus.
 *
 * @summary The list of a FileUpload's files.
 */
function FileUploadList({ className }: FileUploadListProps) {
  const upload = useFileUpload()
  const messages = useGoGoUIMessages()
  const count = upload.items.length

  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const target = event.target as HTMLElement
    const row = target.closest<HTMLElement>('[data-slot="file-upload-row"]')
    if (!row) return
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const remove = row.querySelector<HTMLButtonElement>(
        '[data-slot="file-upload-remove"]',
      )
      if (remove) {
        event.preventDefault()
        remove.click()
      }
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const button = target.closest('button')
    if (!button) return
    const rows = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[data-slot="file-upload-row"]',
      ),
    )
    const next = rows[rows.indexOf(row) + (event.key === 'ArrowDown' ? 1 : -1)]
    if (!next) return
    event.preventDefault()
    const slot = button.dataset.slot ?? 'file-upload-remove'
    ;(
      next.querySelector<HTMLButtonElement>(`[data-slot="${slot}"]`) ??
      next.querySelector<HTMLButtonElement>('[data-slot="file-upload-remove"]')
    )?.focus()
  }

  return (
    <motion.ul
      data-slot="file-upload-list"
      aria-label={messages.fileUploadList}
      aria-hidden={count ? undefined : true}
      onKeyDown={onKeyDown}
      className={cn(
        'grid min-w-0 list-none @container/upload-list',
        upload.inside && 'px-3',
        className,
      )}
      initial={false}
      // The list's own space opens with its first row, never in one frame.
      animate={{
        paddingTop: count && !upload.inside ? 4 : 0,
        paddingBottom: count && upload.inside ? 12 : 0,
      }}
      transition={upload.reduce ? { duration: 0 } : spring.smooth}
    >
      <AnimatePresence initial={false}>
        {upload.items.map((item, index) => (
          <FileUploadItem
            key={item.id}
            item={item}
            delay={
              upload.reduce
                ? 0
                : Math.min(Math.max(0, index - upload.batchStart), 7) *
                  stagger.item *
                  1.6
            }
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}

export { FileUploadList }
export type { FileUploadListProps }
