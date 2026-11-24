// After Arc UI (https://uiarc.dev, MIT licence, Elia Kuratli).

import { useCallback, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Accept, FileRejection } from 'react-dropzone'
import { animate } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import {
  FileUploadContext,
  SHAKE,
  SHAKE_TRANSITION,
} from '../internal/file-upload-context.ts'
import type {
  FileUploadEntry,
  FileUploadHandler,
} from '../internal/file-upload-context.ts'
import { fileSize } from '../internal/file-size.ts'
import { stagger } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { cn } from '../lib/cn.ts'

export { FileUploadDropzone } from './file-upload-dropzone.tsx'
export type { FileUploadDropzoneProps } from './file-upload-dropzone.tsx'
export { FileUploadItem } from './file-upload-item.tsx'
export type { FileUploadItemProps } from './file-upload-item.tsx'
export { FileUploadList } from './file-upload-list.tsx'
export type { FileUploadListProps } from './file-upload-list.tsx'
export type {
  FileUploadEntry,
  FileUploadHandler,
  FileUploadStatus,
} from '../internal/file-upload-context.ts'

const clamp = (value: number) => Math.min(Math.max(value, 0), 100)
const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified

/** The words FileUpload writes, to change on one FileUpload only. */
type FileUploadLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'fileUploadedNamed'
    | 'fileFailed'
    | 'fileFailedNamed'
    | 'fileTooLarge'
    | 'fileTypeRefused'
    | 'fileTypesRefused'
    | 'fileTooMany'
    | 'filesAdded'
    | 'fileRemoved'
    | 'fileRetrying'
  >
>

type FileUploadProps = {
  /** The types taken, as react-dropzone reads them: `{ 'image/*': [] }`. */
  accept?: Accept
  /** Several files (true) or one, which a new one replaces. */
  multiple?: boolean
  /** How many files the list holds at most. */
  maxFiles?: number
  /** In bytes: a heavier file shows as failed and is never sent. */
  maxSize?: number
  /** Sends each added file; without it, the list only shows the choice. */
  onUpload?: FileUploadHandler
  /**
   * The rows, when the page owns them (controlled). Give back the very
   * array `onItemsChange` sent: uploads keep patching the latest rows
   * meanwhile. Another array (a reset, a row removed elsewhere) replaces
   * the rows.
   */
  items?: FileUploadEntry[]
  /**
   * The rows it opens with when the list owns them (uncontrolled): files
   * sent earlier. Give a new `key` to start over.
   */
  defaultItems?: FileUploadEntry[]
  /**
   * Every change of the rows, controlled or not: added, progressing, sent,
   * failed, removed.
   */
  onItemsChange?: (items: FileUploadEntry[]) => void
  /** Once the list holds this many files, the zone folds to a slim bar. */
  compactAt?: number
  /** The accent of the edge, the glow and the bars. */
  color?: Color
  /** The zone's height. */
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  className?: string
  /** `FileUploadDropzone` and `FileUploadList` (after it, or inside it). */
  children: ReactNode
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: FileUploadLabels
}

/**
 * A zone to drop or pick files, and the list of those files with their
 * upload's progress.
 *
 * **Use it for** photos of a venue, documents of an event, an inspection's
 * pictures: several files at once. **Prefer** `FileDrop` for one file (a
 * CSV import), `PhotoDropZone` for a logo or a portrait.
 *
 * **Where**: in a form or a section, full width.
 *
 * **States**: waiting (three sheets fan out when pointed at), a file over
 * it (the dashes close into a line, a glow follows the pointer, the zone
 * breathes, « Déposez pour envoyer »), refused (the zone shakes, the reason
 * shows under it), each row dropping into the list, uploading (a bar and a
 * percentage on one spring), sent (a circle then a tick draw themselves),
 * failed (the row shakes, « Réessayer » opens), folded (`compactAt`).
 *
 * **Compose**: `FileUpload` > `FileUploadDropzone` + `FileUploadList`
 * (after the zone, or inside it as its child).
 *
 * **Key props**: `accept`, `multiple`, `maxFiles`, `maxSize`, `onUpload`
 * (`(item, { onProgress, signal }) => Promise`), `items` + `onItemsChange`
 * (controlled) or `defaultItems` (uncontrolled), `compactAt`, `color`,
 * `size`, `labels` to change its words.
 *
 * **Accessibility**: the zone is a real button (Enter opens the picker);
 * each change is announced once; every bar is a `progressbar`; the arrows
 * move between rows and Delete removes one, the focus going to its
 * neighbour. Reduced motion: no breathing, glow nor shake; the rest fades.
 *
 * @summary Drop or pick files, and follow each one's upload.
 */
function FileUpload({
  accept,
  multiple = true,
  maxFiles = 5,
  maxSize,
  onUpload,
  items: itemsProp,
  defaultItems,
  onItemsChange,
  compactAt,
  color = 'primary',
  size = 'default',
  disabled = false,
  className,
  children,
  labels,
}: FileUploadProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const errorId = useId()
  const [items, setItems] = useControllableState({
    value: itemsProp,
    defaultValue: defaultItems ?? [],
    onChange: onItemsChange,
  })
  const [batchStart, setBatchStart] = useState(0)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const zoneRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [removeButtons] = useState(() => new Map<string, HTMLButtonElement>())
  const [rows] = useState(() => new Map<string, HTMLDivElement>())
  const [controllers] = useState(() => new Map<string, AbortController>())
  const [previews] = useState(() => new Map<string, string>())
  const nextId = useRef(0)

  // Uploads patch the rows long after this render: each patch starts from
  // the latest rows, kept here and changed by `update`.
  const latestRef = useRef<FileUploadEntry[]>(items)
  // The rows this list sent: given back by the page, they are not news.
  const [sentRows] = useState(() => new WeakSet<FileUploadEntry[]>())
  // Rows the page set itself (a reset) are where the next patch starts. A
  // new ref each time the page's rows change: React calls it again.
  const followPageRows = useCallback(
    (node: HTMLSpanElement | null) => {
      if (node && itemsProp !== undefined && !sentRows.has(itemsProp)) {
        latestRef.current = itemsProp
      }
    },
    [itemsProp, sentRows],
  )
  function update(change: (current: FileUploadEntry[]) => FileUploadEntry[]) {
    const next = change(latestRef.current)
    latestRef.current = next
    sentRows.add(next)
    setItems(next)
  }
  function patch(
    id: string,
    change: (item: FileUploadEntry) => FileUploadEntry,
  ) {
    update((current) =>
      current.map((item) => (item.id === id ? change(item) : item)),
    )
  }

  // Leaving the page stops every upload and frees the thumbnails.
  const lifetime = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      return () => {
        controllers.forEach((controller) => controller.abort())
        previews.forEach((url) => URL.revokeObjectURL(url))
      }
    },
    [controllers, previews],
  )

  function shake(node: HTMLElement | null | undefined, delay = 0) {
    if (!reduce && node)
      void animate(node, SHAKE, { ...SHAKE_TRANSITION, delay })
  }

  function startUpload(item: FileUploadEntry) {
    if (!onUpload) return
    controllers.get(item.id)?.abort()
    const controller = new AbortController()
    controllers.set(item.id, controller)
    const start = {
      ...item,
      status: 'uploading' as const,
      progress: 0,
      error: undefined,
    }
    patch(item.id, (current) => ({ ...current, ...start }))
    onUpload(start, {
      signal: controller.signal,
      onProgress: (percent) => {
        if (controller.signal.aborted) return
        patch(item.id, (current) =>
          current.status === 'uploading'
            ? {
                ...current,
                progress: Math.max(current.progress ?? 0, clamp(percent)),
              }
            : current,
        )
      },
    })
      .then(
        () => {
          if (controller.signal.aborted) return
          patch(item.id, (current) => ({
            ...current,
            status: 'uploaded',
            progress: 100,
          }))
          setAnnouncement(messages.fileUploadedNamed(item.name))
        },
        (reason: unknown) => {
          if (controller.signal.aborted) return
          const message =
            reason instanceof Error && reason.message
              ? reason.message
              : messages.fileFailed
          patch(item.id, (current) => ({
            ...current,
            status: 'failed',
            error: message,
            retryable: true,
          }))
          setAnnouncement(messages.fileFailedNamed(item.name, message))
          shake(rows.get(item.id))
        },
      )
      .finally(() => {
        if (controllers.get(item.id) === controller) controllers.delete(item.id)
      })
  }

  function addFiles(accepted: File[], rejected: FileRejection[]) {
    const kept = multiple ? latestRef.current : []
    const unique = accepted.filter(
      (file, index) =>
        accepted.findIndex((other) => sameFile(other, file)) === index &&
        !kept.some((item) => item.file && sameFile(item.file, file)),
    )
    const room = multiple ? Math.max(0, maxFiles - kept.length) : 1
    const added = unique.slice(0, room).map((file): FileUploadEntry => {
      const tooLarge = maxSize !== undefined && file.size > maxSize
      const id = `${file.name}-${file.size}-${file.lastModified}-${nextId.current++}`
      const preview =
        file.type.startsWith('image/') &&
        typeof URL.createObjectURL === 'function'
          ? URL.createObjectURL(file)
          : undefined
      if (preview) previews.set(id, preview)
      return {
        id,
        name: file.name,
        size: file.size,
        file,
        preview,
        status: tooLarge ? 'failed' : onUpload ? 'uploading' : undefined,
        progress: 0,
        error: tooLarge
          ? messages.fileTooLarge(fileSize(maxSize ?? 0, messages.intlLocale))
          : undefined,
        retryable: !tooLarge,
      }
    })
    const overflow = unique.length > added.length
    const [firstRefused] = rejected
    setError(
      firstRefused
        ? rejected.length === 1 && accepted.length === 0
          ? messages.fileTypeRefused(firstRefused.file.name)
          : messages.fileTypesRefused
        : overflow
          ? messages.fileTooMany(maxFiles)
          : '',
    )
    if (rejected.length || overflow) shake(zoneRef.current)
    if (!added.length) return

    if (!multiple) {
      controllers.forEach((controller) => controller.abort())
      controllers.clear()
    }
    setBatchStart(kept.length)
    update((current) => (multiple ? [...current, ...added] : added))
    const failed = added.filter((item) => item.status === 'failed')
    setAnnouncement(
      [
        messages.filesAdded(added.length),
        ...failed.map((item) =>
          messages.fileFailedNamed(item.name, item.error ?? ''),
        ),
      ].join(' '),
    )
    // A file refused on arrival shakes once it has landed in the list.
    failed.forEach((item) => {
      const index = Math.min(added.indexOf(item), 7)
      requestAnimationFrame(() =>
        shake(rows.get(item.id), index * stagger.item * 1.6 + 0.3),
      )
    })
    added.filter((item) => item.status === 'uploading').forEach(startUpload)
  }

  // The focus stays in the list: the next row, else the previous, else the zone.
  function remove(target: FileUploadEntry) {
    controllers.get(target.id)?.abort()
    controllers.delete(target.id)
    const current = latestRef.current
    const index = current.findIndex((item) => item.id === target.id)
    const neighbour = current[index + 1] ?? current[index - 1]
    const preview = previews.get(target.id)
    // The row keeps its thumbnail while it closes.
    if (preview) {
      previews.delete(target.id)
      setTimeout(() => URL.revokeObjectURL(preview), 600)
    }
    update((current) => current.filter((item) => item.id !== target.id))
    setError('')
    setAnnouncement(messages.fileRemoved(target.name))
    requestAnimationFrame(() =>
      (neighbour
        ? removeButtons.get(neighbour.id)
        : triggerRef.current
      )?.focus(),
    )
  }

  // « Réessayer » leaves with the failure: the focus goes to the row's ×.
  function retry(item: FileUploadEntry) {
    setAnnouncement(messages.fileRetrying(item.name))
    startUpload(item)
    requestAnimationFrame(() => removeButtons.get(item.id)?.focus())
  }

  return (
    <FileUploadContext
      value={{
        items,
        batchStart,
        accept,
        multiple,
        disabled,
        size,
        compact: compactAt !== undefined && items.length >= compactAt,
        inside: false,
        reduce,
        canRetry: onUpload !== undefined,
        uploads: onUpload !== undefined,
        error,
        errorId,
        addFiles,
        remove,
        retry,
        registerZone: (node) => {
          zoneRef.current = node
        },
        registerTrigger: (node) => {
          triggerRef.current = node
        },
        registerRow: (id, node) => {
          if (node) rows.set(id, node)
          else rows.delete(id)
        },
        registerRemove: (id, node) => {
          if (node) removeButtons.set(id, node)
          else removeButtons.delete(id)
        },
      }}
    >
      <MotionScope>
        <div
          ref={lifetime}
          data-slot="file-upload"
          data-disabled={disabled || undefined}
          style={{ '--upload-accent': `var(--${color})` } as CSSProperties}
          className={cn('relative grid min-w-0 text-fg', className)}
        >
          {children}
          <span ref={followPageRows} role="status" className="sr-only">
            {announcement}
          </span>
        </div>
      </MotionScope>
    </FileUploadContext>
  )
}

export { FileUpload }
export type { FileUploadProps, FileUploadLabels }
