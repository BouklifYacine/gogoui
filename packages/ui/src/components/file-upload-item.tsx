import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { TargetAndTransition, Transition } from 'motion/react'

import type { GoGoUIIcons } from '../i18n/icons.ts'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useFileUpload } from '../internal/file-upload-context.ts'
import type { FileUploadEntry } from '../internal/file-upload-context.ts'
import { fileSize } from '../internal/file-size.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'

const clamp = (value: number) => Math.min(Math.max(value, 0), 100)

/** The icon of a file without a thumbnail, from its extension. */
function typeIcon(name: string): keyof GoGoUIIcons {
  const extension = name.toLowerCase().split('.').pop() ?? ''
  if (
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'heic'].includes(
      extension,
    )
  )
    return 'fileImage'
  if (['mov', 'mp4', 'webm', 'm4v', 'avi'].includes(extension))
    return 'fileVideo'
  if (['zip', 'gz', 'tar', 'rar', '7z'].includes(extension))
    return 'fileArchive'
  if (
    ['pdf', 'md', 'txt', 'doc', 'docx', 'rtf', 'csv', 'xlsx'].includes(
      extension,
    )
  )
    return 'fileText'
  return 'file'
}

type FileUploadItemProps = {
  item: FileUploadEntry
  /** When it starts to drop in, in seconds: its place in the batch. */
  delay?: number
}

/**
 * One file of a `FileUploadList`: its thumbnail or type icon, its name,
 * its size and its state. It drops in (a little from above, unblurring,
 * its height opening on a spring); uploading, a bar and a percentage move
 * on one spring; at 100 % a circle then a tick draw themselves and the bar
 * folds away; failed, it shakes and « Réessayer » opens its own width.
 *
 * @summary One file of a FileUpload, with its upload's progress.
 */
function FileUploadItem({ item, delay = 0 }: FileUploadItemProps) {
  const upload = useFileUpload()
  const messages = useGoGoUIMessages()
  const { reduce } = upload
  const { status } = item
  const [broken, setBroken] = useState(false)
  const percent = useRef<HTMLSpanElement>(null)
  const formatPercent = new Intl.NumberFormat(messages.intlLocale, {
    style: 'percent',
  })

  // A finished upload keeps its bar until the spring reaches the end, so
  // 100 % is seen before the words turn to « Envoyé ».
  const [filled, setFilled] = useState(status !== 'uploading')
  const [seen, setSeen] = useState(status)
  if (seen !== status) {
    setSeen(status)
    if (status === 'uploading') setFilled(false)
  }
  const phase =
    status === 'uploaded' && !filled && !reduce ? 'uploading' : status
  // Below 100 while it uploads, so the last step to 100 always plays (and
  // ends the bar), even when the progress already said 100.
  const target =
    status === 'uploaded' ? 100 : Math.min(99.5, clamp(item.progress ?? 0))
  const failed = status === 'failed'
  const canRetry = failed && upload.canRetry && item.retryable !== false

  const { registerRow, registerRemove } = upload
  const rowRef = useCallback(
    (node: HTMLDivElement | null) => registerRow(item.id, node),
    [registerRow, item.id],
  )
  const removeRef = useCallback(
    (node: HTMLButtonElement | null) => registerRemove(item.id, node),
    [registerRemove, item.id],
  )

  const textIn: TargetAndTransition = reduce
    ? { opacity: 0 }
    : { opacity: 0, y: '0.3em', filter: `blur(${blur.soft}px)` }
  const textOut: TargetAndTransition = reduce
    ? { opacity: 0, transition: { duration: duration.instant } }
    : {
        opacity: 0,
        y: '-0.3em',
        filter: `blur(${blur.subtle}px)`,
        transition: { duration: duration.fast, ease: [...ease.standard] },
      }
  const textTransition: Transition = reduce
    ? { duration: duration.instant }
    : { duration: duration.standard, ease: [...ease.enter] }
  const fade = { duration: duration.instant }

  return (
    <motion.li
      data-slot="file-upload-item"
      className="min-w-0 overflow-hidden"
      initial={reduce ? { opacity: 0 } : { height: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={
        reduce
          ? { opacity: 0, transition: fade }
          : {
              height: 0,
              opacity: 0,
              transition: {
                height: spring.smooth,
                opacity: {
                  duration: duration.fast,
                  ease: [...ease.standard],
                  delay: 0.04,
                },
              },
            }
      }
      transition={
        reduce ? fade : { height: { ...spring.smooth, delay }, opacity: fade }
      }
    >
      <motion.div
        ref={rowRef}
        data-slot="file-upload-row"
        data-failed={failed || undefined}
        className="relative mt-2 grid min-h-[58px] grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-xl bg-surface py-2 pr-2 pl-[9px] ring-1 ring-line transition-[box-shadow] duration-(--motion-standard) ease-standard ring-inset data-failed:ring-danger-line @max-[300px]/upload-list:grid-cols-[minmax(0,1fr)_auto] @max-[300px]/upload-list:pl-3.5"
        initial={
          reduce
            ? false
            : {
                opacity: 0,
                y: -22,
                scale: 0.94,
                filter: `blur(${blur.soft}px)`,
              }
        }
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={
          reduce
            ? undefined
            : {
                scale: 0.97,
                filter: `blur(${blur.subtle}px)`,
                transition: {
                  duration: duration.fast,
                  ease: [...ease.standard],
                },
              }
        }
        transition={
          reduce
            ? { duration: 0 }
            : {
                y: { ...spring.smooth, delay },
                scale: { ...spring.smooth, delay },
                opacity: {
                  duration: duration.standard,
                  ease: [...ease.enter],
                  delay,
                },
                filter: {
                  duration: duration.standard,
                  ease: [...ease.enter],
                  delay,
                },
              }
        }
      >
        {item.preview && !broken ? (
          <span className="block size-10 overflow-hidden rounded-[10px] bg-subtle ring-1 ring-line ring-inset @max-[300px]/upload-list:hidden">
            <img
              src={item.preview}
              alt=""
              width={40}
              height={40}
              decoding="async"
              onError={() => setBroken(true)}
              className="block size-full object-cover"
            />
          </span>
        ) : (
          <span className="grid size-10 place-items-center text-fg-muted @max-[300px]/upload-list:hidden">
            <GoGoIcon name={typeIcon(item.name)} className="size-5" />
          </span>
        )}

        <span className="grid min-w-0">
          <span
            className="truncate text-sm font-medium text-fg"
            title={item.name}
          >
            {item.name}
          </span>
          <span className="mt-px flex min-w-0 items-center text-xs whitespace-nowrap text-fg-subtle tabular-nums">
            <span>{fileSize(item.size, messages.intlLocale)}</span>
            {phase && (
              <>
                <span aria-hidden="true" className="px-1.5">
                  ·
                </span>
                <span className="relative flex min-w-0 flex-1">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={phase}
                      className={cn(
                        'inline-flex min-w-0 items-center gap-1.5',
                        phase === 'uploaded' && 'text-fg-muted',
                        phase === 'failed' && 'text-danger-fg',
                      )}
                      initial={textIn}
                      animate={{ opacity: 1, y: '0em', filter: 'blur(0px)' }}
                      exit={textOut}
                      transition={textTransition}
                    >
                      {phase === 'uploading' ? (
                        <span>
                          {messages.fileUploading}{' '}
                          <span ref={percent} className="tabular-nums">
                            {formatPercent.format(target / 100)}
                          </span>
                        </span>
                      ) : phase === 'uploaded' ? (
                        <>
                          {/* The circle closes, then the tick draws through it. */}
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.25}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-success-fg"
                          >
                            <motion.path
                              d="M12 2.5a9.5 9.5 0 1 1 0 19a9.5 9.5 0 1 1 0-19"
                              initial={reduce ? false : { pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                duration: duration.standard,
                                ease: [...ease.enter],
                              }}
                            />
                            <motion.path
                              d="m8.2 12.4 2.6 2.6 5-5.2"
                              initial={reduce ? false : { pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                duration: duration.standard,
                                ease: [...ease.enter],
                                delay: 0.16,
                              }}
                            />
                          </svg>
                          <span>{messages.fileUploaded}</span>
                        </>
                      ) : (
                        <>
                          <GoGoIcon
                            name="danger"
                            className="size-3.5 shrink-0"
                          />
                          <span className="truncate" title={item.error}>
                            {item.error || messages.fileFailed}
                          </span>
                        </>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </>
            )}
          </span>

          {/* The bar opens with the upload, fills on a spring, then folds
              away just after the tick draws. */}
          <AnimatePresence initial={false}>
            {phase === 'uploading' && (
              <motion.span
                key="bar"
                className="block overflow-hidden"
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={
                  reduce
                    ? { opacity: 0, transition: fade }
                    : {
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { ...spring.smooth, delay: 0.22 },
                          opacity: {
                            duration: duration.fast,
                            ease: [...ease.standard],
                            delay: 0.16,
                          },
                        },
                      }
                }
                transition={
                  reduce
                    ? fade
                    : {
                        height: spring.smooth,
                        opacity: {
                          duration: duration.standard,
                          ease: [...ease.enter],
                        },
                      }
                }
              >
                <span
                  role="progressbar"
                  aria-label={messages.uploadingFile(item.name)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(target)}
                  className="mt-[7px] mb-0.5 block h-1 overflow-hidden rounded-full bg-tray"
                >
                  {/* It slides in from the left rather than scaling, so its
                      rounded end keeps its shape at every value. One spring
                      moves the bar and counts the percentage. */}
                  <motion.span
                    className="block size-full rounded-full bg-(--upload-accent)"
                    initial={{ x: '-100%' }}
                    animate={{ x: `${target - 100}%` }}
                    transition={reduce ? { duration: 0 } : spring.smooth}
                    onUpdate={(latest) => {
                      const value = clamp(parseFloat(String(latest.x)) + 100)
                      if (percent.current)
                        percent.current.textContent = formatPercent.format(
                          Math.round(value) / 100,
                        )
                      if (status === 'uploaded' && value >= 99.5)
                        setFilled(true)
                    }}
                    onAnimationComplete={() => {
                      if (status === 'uploaded') setFilled(true)
                    }}
                  />
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        <span className="flex items-center">
          <AnimatePresence initial={false}>
            {canRetry && (
              <motion.span
                key="retry"
                className="flex overflow-hidden"
                initial={reduce ? { opacity: 0 } : { width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={
                  reduce
                    ? { opacity: 0, transition: fade }
                    : {
                        width: 0,
                        opacity: 0,
                        transition: { width: spring.smooth, opacity: fade },
                      }
                }
                transition={
                  reduce
                    ? fade
                    : {
                        width: spring.smooth,
                        opacity: {
                          duration: duration.standard,
                          ease: [...ease.enter],
                        },
                      }
                }
              >
                <motion.span
                  className="flex py-[3px] pr-1.5 pl-[3px]"
                  initial={
                    reduce
                      ? false
                      : { scale: 0.8, filter: `blur(${blur.subtle}px)` }
                  }
                  animate={{ scale: 1, filter: 'blur(0px)' }}
                  transition={reduce ? { duration: 0 } : spring.snappy}
                >
                  <Button
                    data-slot="file-upload-retry"
                    type="button"
                    variant="outline"
                    size="xs"
                    aria-label={messages.retryFile(item.name)}
                    title={messages.fileRetry}
                    onClick={() => upload.retry(item)}
                    className="rounded-full @max-[440px]/upload-list:w-7 @max-[440px]/upload-list:px-0"
                  >
                    <GoGoIcon name="retry" className="size-3.5" />
                    <span className="@max-[440px]/upload-list:hidden">
                      {messages.fileRetry}
                    </span>
                  </Button>
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
          <Button
            ref={removeRef}
            data-slot="file-upload-remove"
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={messages.removeFile(item.name)}
            title={messages.removeFile(item.name)}
            disabled={upload.disabled}
            onClick={() => upload.remove(item)}
          >
            <GoGoIcon name="close" className="size-4" />
          </Button>
        </span>
      </motion.div>
    </motion.li>
  )
}

export { FileUploadItem }
export type { FileUploadItemProps }
