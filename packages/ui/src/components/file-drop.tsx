import { useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Accept, FileRejection } from 'react-dropzone'
import { AnimatePresence, MotionConfig, motion, useAnimate } from 'motion/react'
import { ArrowUpIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { fileSize, shortName } from '../internal/file-size.ts'
import { cn } from '../lib/cn.ts'
import { RollingLine } from './rolling-line.tsx'

// How long the green tick stays before the zone waits for a file again.
const DONE_MS = 2600

const settle = { type: 'spring', stiffness: 380, damping: 16 } as const
const gulp = { type: 'spring', stiffness: 420, damping: 14 } as const
const flood = { type: 'spring', stiffness: 260, damping: 21 } as const

type FileDropProps = {
  /** The types taken, as react-dropzone reads them. */
  accept: Accept
  /** « Glissez votre fichier ici ». */
  title: string
  /** Under it while waiting: the formats and the size. */
  hint: string
  /** While the file travels: « Lecture du fichier… ». */
  busyTitle: string
  /** Once it is in: « Fichier lu ». */
  doneTitle: string
  /** The zone's name for a screen reader and a keyboard. */
  label: string
  /** Why a file was refused, from react-dropzone's refusals. */
  refusal: (rejections: FileRejection[]) => string
  /** Does the work; resolves true when it went through. */
  onFile: (file: File) => Promise<boolean>
  onRefuse: (message: string) => void
  disabled?: boolean
  className?: string
}

/**
 * A zone to drop or pick one file.
 *
 * **Use it for** an import (CSV), a contract, a document.
 *
 * **States**: idle, dragging over, busy (`busyTitle`), done (`doneTitle`),
 * refused (`refusal`), disabled.
 *
 * **Key props**: `label`, `title`, `hint` (types and size), `accept`,
 * `onFile`, `onRefuse`.
 *
 * **Accessibility**: a real file button inside; drop is never the only
 * way.
 *
 * @summary A zone to drop or pick one file.
 */
function FileDrop({
  accept,
  title,
  hint,
  busyTitle,
  doneTitle,
  label,
  refusal,
  onFile,
  onRefuse,
  disabled = false,
  className,
}: FileDropProps) {
  const messages = useGoGoUIMessages()
  const [busy, setBusy] = useState<File | null>(null)
  const [done, setDone] = useState<File | null>(null)
  const [zone, animateZone] = useAnimate<HTMLDivElement>()
  const [core, animateCore] = useAnimate<HTMLSpanElement>()
  const doneTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  async function take(file: File) {
    clearTimeout(doneTimer.current)
    setDone(null)
    setBusy(file)
    void animateCore(core.current, { scale: [1.2, 0.92, 1] }, gulp)
    const ok = await onFile(file).catch(() => false)
    setBusy(null)
    if (ok) {
      setDone(file)
      doneTimer.current = setTimeout(() => setDone(null), DONE_MS)
    }
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept,
      multiple: false,
      disabled: disabled || busy !== null,
      onDropAccepted: ([file]) => {
        if (file) void take(file)
      },
      onDropRejected: (rejections) => {
        void animateZone(
          zone.current,
          { x: [0, -10, 10, -6, 6, 0] },
          { duration: 0.4 },
        )
        onRefuse(refusal(rejections))
      },
    })

  const over = isDragActive && !isDragReject
  const describe = (file: File) =>
    `${shortName(file.name)} · ${fileSize(file.size, messages.intlLocale)}`
  const titleText = isDragReject
    ? messages.fileRefused
    : over
      ? messages.dropHere
      : busy
        ? busyTitle
        : done
          ? doneTitle
          : title
  const subText = busy ? describe(busy) : done ? describe(done) : hint

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={zone}
        data-slot="file-drop"
        {...getRootProps({
          // react-dropzone calls its zone « presentation »: it is a button
          // that opens the file picker, so it says so.
          role: 'button',
          'aria-label': label,
          className: cn(
            'relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-[28px] bg-subtle px-6 py-8 text-center outline-none transition-transform duration-300 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus aria-disabled:cursor-progress motion-reduce:transition-none',
            over && 'scale-[1.025]',
            className,
          ),
        })}
      >
        <input {...getInputProps()} />
        <motion.span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0',
            isDragReject ? 'bg-danger-subtle' : 'bg-primary-subtle',
          )}
          initial={false}
          animate={{ opacity: isDragActive ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />

        <motion.span
          ref={core}
          aria-hidden="true"
          animate={{ y: over ? -5 : 0 }}
          transition={settle}
          className="relative flex size-18 items-center justify-center rounded-full bg-control text-fg shadow-button"
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-success"
            initial={false}
            animate={{ scale: done ? 1 : 0 }}
            transition={flood}
          />
          <AnimatePresence>
            {busy && (
              <motion.svg
                key="ring"
                viewBox="0 0 72 72"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  rotate: { duration: 1.1, repeat: Infinity, ease: 'linear' },
                }}
                className="absolute -inset-1 size-[calc(100%+0.5rem)]"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <circle cx="36" cy="36" r="33" className="stroke-tray" />
                <circle
                  cx="36"
                  cy="36"
                  r="33"
                  className="stroke-fg"
                  strokeDasharray="60 148"
                />
              </motion.svg>
            )}
          </AnimatePresence>

          {done ? (
            <svg
              viewBox="0 0 24 24"
              className="relative size-7.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
              />
            </svg>
          ) : (
            <motion.span
              className="relative flex"
              animate={
                busy
                  ? { opacity: 0, scale: 0.6, y: -12 }
                  : over
                    ? { opacity: 1, scale: 1, y: [0, -3.5, 0] }
                    : { opacity: 1, scale: 1, y: 0 }
              }
              transition={
                over && !busy
                  ? {
                      y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
                    }
                  : settle
              }
            >
              <ArrowUpIcon weight="bold" className="size-6.5" />
            </motion.span>
          )}
        </motion.span>

        <span className="relative flex w-full max-w-sm flex-col gap-0.5">
          <RollingLine
            text={titleText}
            className="text-base font-semibold text-fg"
          />
          <RollingLine
            text={subText}
            twoLines
            className="text-sm/5 text-fg-muted tabular-nums"
          />
        </span>

        <span role="status" className="sr-only">
          {busy ? busyTitle : done ? doneTitle : ''}
        </span>
      </div>
    </MotionConfig>
  )
}

export { FileDrop }
export type { FileDropProps }
