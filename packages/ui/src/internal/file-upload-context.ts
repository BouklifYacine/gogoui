import { createContext, useContext } from 'react'
import type { Accept, FileRejection } from 'react-dropzone'

/** Where a file is: being sent, sent, or refused. None: only chosen. */
export type FileUploadStatus = 'uploading' | 'uploaded' | 'failed'

/** One row of the list. */
export type FileUploadEntry = {
  id: string
  name: string
  /** In bytes. */
  size: number
  status?: FileUploadStatus
  /** 0 to 100, while it uploads. */
  progress?: number
  /** Why it failed, in words. */
  error?: string
  /** False when trying again cannot help (a file too large). */
  retryable?: boolean
  file?: File
  /** A thumbnail's URL; images dropped here get one on their own. */
  preview?: string
}

/**
 * Sends one file: report 0-100 through `onProgress`, resolve once it is
 * in, or reject with an Error whose message becomes the row's reason.
 * Removing the row aborts `signal`.
 */
export type FileUploadHandler = (
  item: FileUploadEntry,
  options: { onProgress: (percent: number) => void; signal: AbortSignal },
) => Promise<void>

/** What FileUpload shares with its zone, its list and its rows. */
export type FileUploadContextValue = {
  items: FileUploadEntry[]
  /** The first row of the latest batch: the stagger starts there. */
  batchStart: number
  accept?: Accept
  multiple: boolean
  disabled: boolean
  size: 'sm' | 'default' | 'lg'
  /** The zone folds to a slim bar once the list is this long. */
  compact: boolean
  /** True for a list drawn inside the zone. */
  inside: boolean
  reduce: boolean
  /** Rows can be tried again (an `onUpload` is given). */
  canRetry: boolean
  /** Uploads are sent (an `onUpload` is given). */
  uploads: boolean
  /** Why the last drop was refused, shown under the zone. */
  error: string
  errorId: string
  addFiles: (accepted: File[], rejected: FileRejection[]) => void
  remove: (item: FileUploadEntry) => void
  retry: (item: FileUploadEntry) => void
  /** The zone, which shakes at a refusal. */
  registerZone: (node: HTMLDivElement | null) => void
  /** The zone's button, where the focus goes once the list is empty. */
  registerTrigger: (node: HTMLButtonElement | null) => void
  /** A row's box (it shakes) and its remove button (it takes the focus). */
  registerRow: (id: string, node: HTMLDivElement | null) => void
  registerRemove: (id: string, node: HTMLButtonElement | null) => void
}

export const FileUploadContext = createContext<FileUploadContextValue | null>(
  null,
)

/** The upload around a part. */
export function useFileUpload(): FileUploadContextValue {
  const context = useContext(FileUploadContext)
  if (!context) throw new Error('FileUpload parts go inside <FileUpload>.')
  return context
}

/** A short, fading side-to-side shake: a refusal reads as « no ». */
export const SHAKE = { x: [0, -7, 6, -4, 3, -1.5, 0] }
export const SHAKE_TRANSITION = { duration: 0.42, ease: 'easeOut' } as const
