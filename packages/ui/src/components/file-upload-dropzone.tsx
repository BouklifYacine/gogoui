import { useCallback, useId, useRef } from 'react'
import type { CSSProperties, DragEvent, HTMLAttributes, ReactNode } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  AnimatePresence,
  m,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import {
  FileUploadContext,
  useFileUpload,
} from '../internal/file-upload-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { cn } from '../lib/cn.ts'

/** One dash and its gap, in px: the edge's length is a whole number of them. */
const PERIOD = 7
/** The glow trails the pointer on a soft spring. */
const GLOW = { stiffness: 260, damping: 32, mass: 0.8 }
/** The zone's padding, top and bottom, by size; folded, a slim bar. */
const PADDING = { sm: [18, 24], default: [26, 34], lg: [34, 44] } as const

/** Only the edge's 1.5px ring of the glow shows. */
const ringMask: CSSProperties = {
  padding: 1.5,
  WebkitMask:
    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
}

const sheet =
  'absolute inset-0 flex items-end justify-center rounded-[7px] bg-raised pb-[5px] text-fg-subtle shadow-xs ring-1 ring-line origin-bottom [transition-duration:var(--motion-spring),var(--motion-spring),var(--motion-standard),var(--motion-standard)] [transition-property:translate,rotate,color,box-shadow] [transition-timing-function:var(--motion-ease-spring),var(--motion-ease-spring),var(--motion-ease-standard),var(--motion-ease-standard)] before:absolute before:top-2 before:left-[7px] before:h-0.5 before:w-4 before:rounded-full before:bg-current before:opacity-30 after:absolute after:top-[13px] after:left-[7px] after:h-0.5 after:w-[11px] after:rounded-full after:bg-current after:opacity-30 group-data-dragging/zone:text-fg-muted group-data-dragging/zone:ring-line-strong'

/** Three sheets: at rest ±10°, pointed at ±15°, under a file ±22°. */
const pose = {
  back: '-translate-x-[9px] translate-y-[2px] -rotate-10 group-hover/zone:-translate-x-[13px] group-hover/zone:-rotate-15 group-data-dragging/zone:-translate-x-5 group-data-dragging/zone:-translate-y-[2px] group-data-dragging/zone:-rotate-22',
  side: 'translate-x-[9px] translate-y-[2px] rotate-10 group-hover/zone:translate-x-[13px] group-hover/zone:rotate-15 group-data-dragging/zone:translate-x-5 group-data-dragging/zone:-translate-y-[2px] group-data-dragging/zone:rotate-22',
  front:
    'group-hover/zone:-translate-y-0.5 group-data-dragging/zone:-translate-y-2',
} as const

/** The words FileUploadDropzone writes, to change on one FileUploadDropzone only. */
type FileUploadDropzoneLabels = Partial<
  Pick<GoGoUIMessages, 'fileUploadDrop' | 'fileUploadDropAdd'>
>

type FileUploadDropzoneProps = {
  /** « Ajoutez des fichiers » by default. */
  title?: string
  /** Under it: what to do, the formats, the size. */
  hint?: string
  /** While a file is over the zone: « Déposez pour envoyer » by default. */
  dropTitle?: string
  className?: string
  /** A `FileUploadList` to draw inside the zone's edge. */
  children?: ReactNode
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: FileUploadDropzoneLabels
}

/**
 * The zone of a `FileUpload`: a button that opens the file picker, and a
 * target for files dragged from the desktop or pasted. Its dashed edge
 * closes into a line under a file, a light follows the pointer, it
 * breathes while it waits; three sheets fan out when it is pointed at.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary The zone files are dropped on, or picked from.
 */
function FileUploadDropzone({
  title,
  hint,
  dropTitle,
  className,
  children,
  labels,
}: FileUploadDropzoneProps) {
  const upload = useFileUpload()
  const messages = useGoGoUIMessages(labels)
  const hintId = useId()
  const edge = useRef<SVGRectElement>(null)

  const pointerX = useMotionValue(50)
  const pointerY = useMotionValue(50)
  const glowX = useSpring(pointerX, GLOW)
  const glowY = useSpring(pointerY, GLOW)
  const edgeLight = useMotionTemplate`radial-gradient(180px circle at ${glowX}% ${glowY}%, var(--upload-accent), transparent 70%)`
  const washLight = useMotionTemplate`radial-gradient(260px circle at ${glowX}% ${glowY}%, color-mix(in oklab, var(--upload-accent) 6%, transparent), transparent 70%)`

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: upload.accept,
    // The list decides how many it keeps: the zone takes them all.
    multiple: true,
    disabled: upload.disabled,
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted, rejected) => upload.addFiles(accepted, rejected),
  })
  const dragging = isDragActive && !upload.disabled

  // The light leans towards the file; it jumps there first, then follows.
  function track(event: DragEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - box.left) / Math.max(1, box.width)) * 100
    const y = ((event.clientY - box.top) / Math.max(1, box.height)) * 100
    if (upload.reduce || !dragging) {
      pointerX.jump(x)
      pointerY.jump(y)
      glowX.jump(x)
      glowY.jump(y)
    } else {
      pointerX.set(x)
      pointerY.set(y)
    }
  }

  // react-dropzone's own ref is taken aside (under `refKey`, which its
  // types do not follow), to share the node with ours.
  const { dropzoneRef, ...rootProps } = getRootProps({
    refKey: 'dropzoneRef',
    onDragEnter: track,
    onDragOver: track,
  }) as unknown as HTMLAttributes<HTMLElement> & {
    dropzoneRef: { current: HTMLElement | null }
  }

  // The edge is drawn, not bordered, so its dashes can close into a line;
  // its length is fitted to the perimeter, so every dash is equal and the
  // seam never shows, whatever the zone's size.
  const { registerZone, registerTrigger } = upload
  const zoneRef = useCallback(
    (zone: HTMLDivElement | null) => {
      registerZone(zone)
      dropzoneRef.current = zone
      if (!zone) return
      const fit = () => {
        const rect = edge.current
        if (!rect) return
        const width = zone.offsetWidth - 1
        const height = zone.offsetHeight - 1
        const radius = Math.max(
          0,
          Math.min(
            parseFloat(getComputedStyle(zone).borderTopLeftRadius) - 0.5,
            width / 2,
            height / 2,
          ),
        )
        const perimeter =
          2 * (width + height) - 8 * radius + 2 * Math.PI * radius
        rect.setAttribute('rx', String(radius))
        rect.setAttribute(
          'pathLength',
          String(Math.max(8, Math.round(perimeter / PERIOD)) * PERIOD),
        )
      }
      fit()
      const observer =
        typeof ResizeObserver === 'undefined'
          ? undefined
          : new ResizeObserver(fit)
      observer?.observe(zone)
      zone.addEventListener('transitionend', fit)
      return () => {
        observer?.disconnect()
        zone.removeEventListener('transitionend', fit)
        registerZone(null)
        dropzoneRef.current = null
      }
    },
    [registerZone, dropzoneRef],
  )

  const rowsInside = children !== undefined && upload.items.length > 0
  const [top, bottom] = PADDING[upload.size]
  const label = dragging
    ? (dropTitle ??
      (upload.uploads ? messages.fileUploadDrop : messages.fileUploadDropAdd))
    : (title ?? messages.fileUploadTitle)
  const fold = upload.reduce
    ? {
        initial: { opacity: 0 },
        exit: { opacity: 0, transition: { duration: duration.instant } },
        transition: { duration: duration.instant },
      }
    : {
        initial: { height: 0, opacity: 0 },
        exit: {
          height: 0,
          opacity: 0,
          transition: {
            height: spring.smooth,
            opacity: { duration: duration.fast, ease: [...ease.standard] },
          },
        },
        transition: {
          height: spring.smooth,
          opacity: { duration: duration.standard, ease: [...ease.enter] },
        },
      }

  return (
    <div
      data-slot="file-upload-dropzone"
      className={cn('grid min-w-0', className)}
    >
      <m.div
        className="grid min-w-0"
        animate={
          dragging && !upload.reduce ? { scale: [1, 1.012, 1] } : { scale: 1 }
        }
        transition={
          dragging && !upload.reduce
            ? { duration: 2.2, repeat: Infinity, ease: [...ease.inOut] }
            : spring.smooth
        }
      >
        <div
          {...rootProps}
          ref={zoneRef}
          data-dragging={dragging || undefined}
          data-compact={upload.compact || undefined}
          className={cn(
            'group/zone relative grid min-w-0 rounded-[28px] bg-surface transition-[background-color,border-radius] duration-(--motion-standard) ease-standard data-compact:rounded-2xl',
            upload.disabled
              ? 'cursor-not-allowed opacity-60'
              : 'hover:bg-subtle active:bg-subtle',
            dragging &&
              'bg-[color-mix(in_oklab,var(--upload-accent)_2.5%,var(--surface))] hover:bg-[color-mix(in_oklab,var(--upload-accent)_2.5%,var(--surface))]',
          )}
        >
          {!upload.reduce && (
            <m.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-(--motion-standard) ease-standard group-data-dragging/zone:opacity-100"
              style={{ backgroundImage: washLight }}
            />
          )}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-[0.5px] left-[0.5px] h-[calc(100%-1px)] w-[calc(100%-1px)] overflow-visible"
          >
            <rect
              ref={edge}
              width="100%"
              height="100%"
              rx={27.5}
              pathLength={1358}
              className="fill-none stroke-line-strong [stroke-dasharray:3.5_3.5] [stroke-dashoffset:0] [stroke-width:1] [transition-duration:var(--motion-fast),var(--motion-standard),var(--motion-standard)] [transition-property:stroke,stroke-dasharray,stroke-dashoffset] [transition-timing-function:var(--motion-ease-standard)] group-hover/zone:stroke-fg-subtle group-data-dragging/zone:[stroke-dasharray:7_0] group-data-dragging/zone:[stroke-dashoffset:1.75] group-data-dragging/zone:[stroke:color-mix(in_oklab,var(--upload-accent)_40%,var(--line))]"
            />
          </svg>
          {!upload.reduce && (
            <m.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-(--motion-standard) ease-standard group-data-dragging/zone:opacity-100"
              style={{ ...ringMask, backgroundImage: edgeLight }}
            />
          )}

          <m.button
            ref={registerTrigger}
            type="button"
            onClick={open}
            disabled={upload.disabled}
            aria-describedby={
              [hintId, upload.error && upload.errorId]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className="relative flex w-full cursor-pointer flex-col items-stretch justify-center rounded-[inherit] px-5 text-center outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus disabled:cursor-not-allowed *:pointer-events-none"
            initial={false}
            animate={{
              paddingTop: upload.compact ? 16 : top,
              paddingBottom: upload.compact
                ? rowsInside
                  ? 8
                  : 16
                : rowsInside
                  ? top
                  : bottom,
            }}
            transition={upload.reduce ? { duration: 0 } : spring.smooth}
          >
            <AnimatePresence initial={false}>
              {(!upload.compact || dragging) && (
                <m.span
                  key="sheets"
                  className="flex flex-col overflow-hidden"
                  animate={{ height: 'auto', opacity: 1 }}
                  {...fold}
                >
                  <span
                    aria-hidden="true"
                    className="relative mx-auto mt-2.5 mb-3.5 block h-11 w-9"
                  >
                    <span className={cn(sheet, pose.back)} />
                    <span className={cn(sheet, pose.side)} />
                    <span className={cn(sheet, pose.front)}>
                      <GoGoIcon
                        name="upload"
                        weight="bold"
                        className="size-3.5 transition-[translate] duration-(--motion-spring) ease-spring group-data-dragging/zone:-translate-y-[3px]"
                      />
                    </span>
                  </span>
                </m.span>
              )}
            </AnimatePresence>
            <strong className="relative block text-sm font-medium text-fg">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.span
                  key={label}
                  className="inline-block max-w-full truncate align-top"
                  initial={
                    upload.reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: '0.3em',
                          filter: `blur(${blur.soft}px)`,
                        }
                  }
                  animate={{ opacity: 1, y: '0em', filter: 'blur(0px)' }}
                  exit={
                    upload.reduce
                      ? {
                          opacity: 0,
                          transition: { duration: duration.instant },
                        }
                      : {
                          opacity: 0,
                          y: '-0.3em',
                          filter: `blur(${blur.subtle}px)`,
                          transition: {
                            duration: duration.fast,
                            ease: [...ease.standard],
                          },
                        }
                  }
                  transition={
                    upload.reduce
                      ? { duration: duration.instant }
                      : { duration: duration.standard, ease: [...ease.enter] }
                  }
                >
                  {label}
                </m.span>
              </AnimatePresence>
            </strong>
            <span id={hintId} className="mt-1.5 text-sm text-fg-muted">
              {hint ?? messages.fileUploadHint}
            </span>
          </m.button>

          <input
            {...getInputProps({
              multiple: upload.multiple,
              'aria-label': undefined,
              'aria-hidden': true,
            })}
          />
          {children !== undefined && (
            <FileUploadContext value={{ ...upload, inside: true }}>
              {children}
            </FileUploadContext>
          )}
        </div>
      </m.div>

      <AnimatePresence initial={false}>
        {upload.error && (
          <m.div
            key="error"
            className="overflow-hidden"
            initial={upload.reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={
              upload.reduce
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: spring.smooth,
                      opacity: { duration: duration.instant },
                    },
                  }
            }
            transition={
              upload.reduce
                ? { duration: 0 }
                : {
                    height: spring.smooth,
                    opacity: { duration: duration.fast },
                  }
            }
          >
            <p
              id={upload.errorId}
              className="flex items-start gap-1.5 pt-3 text-sm text-danger-fg"
            >
              <GoGoIcon name="danger" className="mt-0.5 size-3.5 shrink-0" />
              {upload.error}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { FileUploadDropzone }
export type { FileUploadDropzoneProps, FileUploadDropzoneLabels }
