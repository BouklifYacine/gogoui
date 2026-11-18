import { useState } from 'react'
import type { ReactNode } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageIcon, UploadSimpleIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { Spinner } from './spinner.tsx'

// What a phone and a computer both give: a phone converts its HEIC photos
// to JPEG for these types.
const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

type PhotoDropZoneProps = {
  /** A logo is shown whole on a square; a portrait fills a circle. */
  shape: 'logo' | 'portrait'
  /** Beside the image: advice, formats, size. */
  description: string
  /** The button's words: « Changer le logo ». */
  pickLabel: string
  /** The image saved today; null before the first one. */
  current: { src: string; alt: string } | null
  /** Beside the button once there is an image (« Retirer »). */
  extraActions?: ReactNode
  /** Sends the file; resolves true once it is saved. */
  onPick: (file: File) => Promise<boolean>
  /** A file refused before sending, said in the page's alert. */
  onRefuse: (message: string) => void
}

/**
 * One image, as settings pages show it: small on the left, the advice
 * and the buttons beside it. A file can be dropped on the image or picked
 * with the button (the keyboard's way). While a new image travels it
 * shows at once, faded, in its place. Needs `react-dropzone`.
 *
 * @summary A logo or a portrait to drop or pick.
 */
function PhotoDropZone({
  shape,
  description,
  pickLabel,
  current,
  extraActions,
  onPick,
  onRefuse,
}: PhotoDropZoneProps) {
  const messages = useGoGoUIMessages()
  // The file on its way, shown from the computer before it is saved.
  const [preview, setPreview] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function send(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setSaved(false)
    try {
      setSaved(await onPick(file))
    } finally {
      setPreview(null)
      URL.revokeObjectURL(url)
    }
  }

  const busy = preview !== null
  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      accept: ACCEPTED,
      multiple: false,
      disabled: busy,
      // The button opens the files for the keyboard: the image is a
      // shortcut for a mouse and a drop, not a second button.
      noKeyboard: true,
      onDropAccepted: ([file]) => {
        if (file) void send(file)
      },
      onDropRejected: (rejections) => {
        const codes = rejections.flatMap(({ errors }) =>
          errors.map((error) => error.code),
        )
        onRefuse(
          codes.includes('too-many-files')
            ? messages.onlyOneImage
            : messages.notAnImage,
        )
      },
    })

  const image = preview ?? current?.src ?? null
  const round = shape === 'portrait'

  return (
    <div
      data-slot="photo-drop-zone"
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
    >
      <div
        {...getRootProps({
          role: undefined,
          className: cn(
            'group relative flex size-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden border bg-surface transition-colors',
            round ? 'rounded-full' : 'rounded-2xl',
            image ? 'border-line' : 'border-dashed border-line-strong bg-tray',
            isDragActive && 'border-fg bg-primary-subtle',
            isDragReject && 'border-danger bg-danger-subtle',
            busy && 'cursor-progress',
          ),
        })}
      >
        <input {...getInputProps()} />
        {image ? (
          <img
            src={image}
            alt={preview ? '' : (current?.alt ?? '')}
            className={cn(
              'size-full transition-opacity',
              round ? 'object-cover' : 'object-contain p-3',
              busy && 'opacity-50',
            )}
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex flex-col items-center gap-1 px-2 text-center text-xs text-fg-muted"
          >
            <ImageIcon className="size-6" />
            {messages.dropImage}
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-6 text-fg" />
          </span>
        )}
        {image && !busy && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/45 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-fine:flex"
          >
            {messages.change}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="max-w-prose text-sm text-fg-muted">{description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            loading={busy}
            loadingText={messages.sendingImage}
            onClick={open}
          >
            <UploadSimpleIcon aria-hidden="true" />
            {pickLabel}
          </Button>
          {current && !busy && extraActions}
        </div>
        <span role="status" className="sr-only">
          {busy ? messages.sendingImage : saved ? messages.imageSaved : ''}
        </span>
      </div>
    </div>
  )
}

export { PhotoDropZone }
export type { PhotoDropZoneProps }
