import { useId, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Transition } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'
import { Badge } from './badge.tsx'

/** What a release note is: something new, something better, a fix. */
type ChangelogKind = 'new' | 'improved' | 'fixed'

/** Each kind's colour, unless told otherwise. */
const changelogKindColors: Record<ChangelogKind, Color> = {
  new: 'primary',
  improved: 'neutral',
  fixed: 'success',
}

const still: Transition = { duration: 0 }

/** The words ChangelogEntry writes, to change on one ChangelogEntry only. */
type ChangelogEntryLabels = Partial<
  Pick<GoGoUIMessages, 'changelogNew' | 'changelogImproved' | 'changelogFixed'>
>

type ChangelogEntryProps = {
  /** The release day, ISO (`2026-11-18`): written in the provider's language. */
  date: string
  /** The version it shipped in, without the « v ». */
  version?: string
  kind: ChangelogKind
  /** The kind's colour, over its default (new primary, improved neutral, fixed green). */
  color?: Color
  title: string
  /** One line under the title. */
  summary?: string
  /** Open (controlled). */
  open?: boolean
  /** Open at first (uncontrolled). */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** What the row opens on: details, a photo, a code. Without it the row does not open. */
  children?: ReactNode
  className?: string
  /** The row's `<li>` (AnimatePresence's popLayout measures it). */
  ref?: Ref<HTMLLIElement>
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ChangelogEntryLabels
}

/**
 * One release note, a row of a changelog that opens on its details, after
 * Arc UI (https://uiarc.dev, MIT).
 *
 * **Use it for** a line of « Nouveautés »: the day, the version, the kind,
 * the title and a summary. **Prefer** `ChangelogFeed` for the whole page
 * (filters, months); `Timeline` for a record's history.
 *
 * **Where**: in a `<ul>`, one per note; it is the `<li>`.
 *
 * **States**: closed, open (the details rise in, the chevron turns), and
 * with no `children` a plain row that does not open. Under 640 px of width
 * the day and version go above the title.
 *
 * **Key props**: `date` (ISO), `version`, `kind` (new, improved, fixed) +
 * `color`, `title`, `summary`, `open` / `defaultOpen` + `onOpenChange`,
 * `children` (what it opens on), `labels` to change its words.
 *
 * **Accessibility**: the row is a button with `aria-expanded`; the day is a
 * `<time>`; the kind is written in words. Still with reduced motion.
 *
 * @summary One release note of a changelog, that opens on its details.
 */
function ChangelogEntry({
  date,
  version,
  kind,
  color,
  title,
  summary,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  ref,
  labels,
}: ChangelogEntryProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const panelId = useId()
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isOpen = open ?? innerOpen
  const opens = children !== undefined && children !== null
  const kindLabel = {
    new: messages.changelogNew,
    improved: messages.changelogImproved,
    fixed: messages.changelogFixed,
  }[kind]
  const day = new Intl.DateTimeFormat(messages.intlLocale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))

  function toggle() {
    const next = !isOpen
    if (open === undefined) {
      setInnerOpen(next)
    }
    onOpenChange?.(next)
  }

  const content = (
    <>
      {/* Beside the title on a computer, above it on a phone. */}
      <span className="flex flex-col items-start gap-2 pt-px @max-[640px]:col-start-1 @max-[640px]:row-start-1 @max-[640px]:flex-row @max-[640px]:items-center @max-[640px]:gap-2.5 @max-[640px]:pt-0">
        <time
          dateTime={date}
          className="text-sm leading-5 text-fg-muted tabular-nums"
        >
          {day}
        </time>
        {version && (
          <span className="rounded-md px-1.5 font-mono text-xs leading-[18px] whitespace-nowrap text-fg-muted tabular-nums ring-1 ring-line ring-inset">
            v{version}
          </span>
        )}
      </span>
      <span className="grid min-w-0 gap-1.5 @max-[640px]:col-span-2 @max-[640px]:row-start-2">
        <Badge
          variant="subtle"
          color={color ?? changelogKindColors[kind]}
          className="mb-0.5"
        >
          {kindLabel}
        </Badge>
        <span className="text-base font-medium text-fg">{title}</span>
        {summary && (
          <span className="max-w-[62ch] text-sm text-fg-muted">{summary}</span>
        )}
      </span>
    </>
  )

  const rowClass =
    'grid w-full grid-cols-[104px_minmax(0,1fr)_20px] items-start gap-x-6 gap-y-1 px-7 py-5.5 text-left @max-[640px]:grid-cols-[minmax(0,1fr)_20px] @max-[640px]:gap-x-3 @max-[640px]:gap-y-2.5 @max-[640px]:px-5 @max-[640px]:py-4.5'

  return (
    <MotionScope>
      <m.li
        ref={ref}
        layout="position"
        data-slot="changelog-entry"
        data-open={isOpen || undefined}
        className={cn(
          'group/changelog-entry @container relative border-b border-line-subtle bg-surface last:border-b-0',
          className,
        )}
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, filter: `blur(${blur.subtle}px)` }
        }
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={
          reduce
            ? { opacity: 0, transition: { duration: duration.instant } }
            : {
                opacity: 0,
                scale: 0.98,
                filter: `blur(${blur.subtle}px)`,
                transition: { duration: duration.exit, ease: ease.standard },
              }
        }
        transition={
          reduce
            ? { duration: 0, opacity: { duration: duration.instant } }
            : {
                opacity: { duration: duration.standard },
                filter: { duration: duration.standard },
                layout: spring.smooth,
              }
        }
      >
        {opens ? (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            onClick={toggle}
            className={cn(
              rowClass,
              'transition-colors duration-(--motion-standard) ease-standard outline-none hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid',
            )}
          >
            {content}
            <m.span
              aria-hidden="true"
              className="mt-px grid size-5 place-items-center text-fg-subtle transition-colors duration-(--motion-standard) group-hover/changelog-entry:text-fg group-data-[open]/changelog-entry:text-fg @max-[640px]:col-start-2 @max-[640px]:row-start-1 @max-[640px]:mt-0"
              initial={false}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={reduce ? still : spring.snappy}
            >
              <GoGoIcon name="chevronDown" className="size-4" />
            </m.span>
          </button>
        ) : (
          <div className={rowClass}>{content}</div>
        )}
        <AnimatePresence initial={false}>
          {opens && isOpen && (
            <m.div
              key="panel"
              id={panelId}
              className="overflow-hidden"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0, transition: reduce ? still : spring.smooth }}
              transition={reduce ? still : spring.smooth}
            >
              <m.div
                className="pr-18 pb-7 pl-39 text-sm text-fg-muted @max-[640px]:px-5 @max-[640px]:pb-6"
                initial={{ opacity: 0, y: 8, filter: `blur(${blur.soft}px)` }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  transition: { duration: duration.instant },
                }}
                transition={
                  reduce
                    ? { duration: 0, opacity: { duration: duration.instant } }
                    : {
                        y: { ...spring.smooth, delay: 0.06 },
                        opacity: { duration: duration.standard, delay: 0.06 },
                        filter: { duration: duration.standard, delay: 0.06 },
                      }
                }
              >
                {children}
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </m.li>
    </MotionScope>
  )
}

export { ChangelogEntry, changelogKindColors }
export type { ChangelogEntryProps, ChangelogKind, ChangelogEntryLabels }
