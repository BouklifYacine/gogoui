import { useCallback, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import type { Transition, Variants } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { ChangelogChip } from '../internal/changelog-chip.tsx'
import { ChangelogMediaView } from '../internal/changelog-media.tsx'
import type { Color } from '../internal/colors.ts'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { RollingCount } from '../internal/rolling-count.tsx'
import { cn } from '../lib/cn.ts'
import { ChangelogEntry, changelogKindColors } from './changelog-entry.tsx'
import type { ChangelogKind } from './changelog-entry.tsx'

/** A photo or a code shown under an opened note. */
type ChangelogMedia =
  | {
      type: 'photo'
      src: string
      alt: string
      caption?: string
      /** The photo's size in px, so nothing jumps while it loads. */
      width?: number
      height?: number
    }
  | { type: 'code'; file: string; code: string }

/** One release note. */
type ChangelogItem = {
  id: string
  /** The release day, ISO (`2026-11-18`): it also sets the note's month. */
  date: string
  version?: string
  kind: ChangelogKind
  title: string
  summary?: string
  /** The lines shown once the note is opened. */
  details?: string[]
  media?: ChangelogMedia
}

type ChangelogFeedProps = {
  /** The notes, newest first. Their months are read from `date`. */
  entries: ChangelogItem[]
  /** « Nouveautés » by default. */
  title?: string
  /** One line under the title (« Talyra 0.32 est sortie le 12 novembre »). */
  subtitle?: ReactNode
  /** A line at the end of the list. */
  endNote?: ReactNode
  /** A slot beside the title: a link to the full history, a button. */
  action?: ReactNode
  /** The notes open at first; the newest one by default. */
  defaultOpen?: string[]
  /** Each kind's colour, over the default (new primary, improved neutral, fixed green). */
  kindColors?: Partial<Record<ChangelogKind, Color>>
  /** The list's height (560 px, 520 px under 640 px of width by default). */
  height?: number | string
  className?: string
}

const KINDS: ChangelogKind[] = ['new', 'improved', 'fixed']
const still: Transition = { duration: 0 }

// The month's name rises when one scrolls down, falls when one goes back.
const rise: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: direction * 14,
    filter: `blur(${blur.soft}px)`,
  }),
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction * -14,
    filter: `blur(${blur.soft}px)`,
    transition: { duration: duration.exit, ease: ease.standard },
  }),
}

/** The month's words, in the provider's language: « Novembre », « 2026 », « Nov. ». */
function monthWords(key: string, locale: string) {
  const day = new Date(`${key}-01T00:00:00Z`)
  const parts = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(day)
  const upper = (word: string) =>
    word.charAt(0).toLocaleUpperCase(locale) + word.slice(1)
  const month = upper(parts.find((part) => part.type === 'month')?.value ?? '')
  const year = parts.find((part) => part.type === 'year')?.value ?? ''
  const short = upper(
    new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(
      day,
    ),
  )
  return { month, year, short, label: `${month} ${year}` }
}

/**
 * The « Nouveautés » block: a product's release notes by month, after Arc
 * UI (https://uiarc.dev, MIT).
 *
 * **Use it for** a public « Nouveautés » page, or the app's « Quoi de neuf »
 * in a `Sheet`. **Not for** a record's history (`Timeline`).
 *
 * **Where**: centred on the page, 920 px wide at most.
 *
 * **States**: filtered by kind (the chips tick, the counts roll, « Tout
 * afficher » slides in), notes open or closed, the month bar following the
 * scroll (its name rolls, its pill glides), nothing left by the filter.
 * Under 640 px of width each note's day goes above its title.
 *
 * **Compose**: built from `ChangelogEntry` rows, `Badge` and `CopyButton`;
 * `action` takes a link or a button beside the title (no e-mail
 * subscription built in).
 *
 * **Key props**: `entries` (newest first, months read from `date`),
 * `title`, `subtitle`, `endNote`, `action`, `defaultOpen`, `kindColors`,
 * `height`.
 *
 * **Accessibility**: chips are toggle buttons (`aria-pressed`) and the
 * shown count is read when the filter changes; the month bar is a `nav`
 * with `aria-current`; the scrolling list is a named region reachable with
 * Tab; each month is an `h3`. Still with reduced motion.
 *
 * @summary A product's release notes by month, with kind filters.
 */
function ChangelogFeed({
  entries,
  title,
  subtitle,
  endNote,
  action,
  defaultOpen,
  kindColors,
  height,
  className,
}: ChangelogFeedProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const uid = useId()
  const [filters, setFilters] = useState<ChangelogKind[]>([])
  const [open, setOpen] = useState<string[]>(
    () => defaultOpen ?? (entries[0] ? [entries[0].id] : []),
  )
  const [active, setActive] = useState({ key: '', direction: 1 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const colorOf = (kind: ChangelogKind) =>
    kindColors?.[kind] ?? changelogKindColors[kind]
  const kindLabel = {
    new: messages.changelogNew,
    improved: messages.changelogImproved,
    fixed: messages.changelogFixed,
  }
  const total = entries.length
  const visible = entries.filter(
    (entry) => filters.length === 0 || filters.includes(entry.kind),
  )
  // The months in the order of the notes, each with its shown notes.
  const groups: {
    key: string
    words: ReturnType<typeof monthWords>
    items: ChangelogItem[]
  }[] = []
  for (const entry of visible) {
    const key = entry.date.slice(0, 7)
    const group = groups.find((item) => item.key === key)
    if (group) {
      group.items.push(entry)
    } else {
      groups.push({
        key,
        words: monthWords(key, messages.intlLocale),
        items: [entry],
      })
    }
  }
  const current = groups.find((group) => group.key === active.key) ?? groups[0]

  // The month whose title has passed the top of the list is the current
  // one; at the very bottom, the last. Read from the page itself, so it
  // stays right while notes open and filters change.
  const sync = useCallback(() => {
    const scroller = scrollRef.current
    if (!scroller) {
      return
    }
    const sections = Array.from(
      scroller.querySelectorAll<HTMLElement>('[data-month]'),
    )
    const first = sections[0]?.dataset.month
    if (!first) {
      return
    }
    const line = scroller.getBoundingClientRect().top + 28
    let key = first
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) {
        key = section.dataset.month ?? key
      }
    }
    const atEnd =
      scroller.scrollTop > 0 &&
      scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
    if (atEnd) {
      key = sections.at(-1)?.dataset.month ?? key
    }
    // Older months come later: going to one rolls the name up.
    setActive((previous) =>
      previous.key === key
        ? previous
        : { key, direction: key < previous.key ? 1 : -1 },
    )
  }, [])

  const schedule = useCallback(() => {
    if (frame.current) {
      return
    }
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      sync()
    })
  }, [sync])

  // The list's height changes when a note opens or a filter applies.
  const watchList = useCallback(
    (list: HTMLDivElement | null) => {
      if (!list || typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const observer = new ResizeObserver(schedule)
      observer.observe(list)
      return () => {
        observer.disconnect()
        cancelAnimationFrame(frame.current)
        frame.current = 0
      }
    },
    [schedule],
  )

  function toggleFilter(kind: ChangelogKind) {
    setFilters((previous) =>
      previous.includes(kind)
        ? previous.filter((item) => item !== kind)
        : [...previous, kind],
    )
  }

  function setEntryOpen(id: string, next: boolean) {
    setOpen((previous) =>
      next ? [...previous, id] : previous.filter((item) => item !== id),
    )
  }

  function jumpTo(key: string) {
    const scroller = scrollRef.current
    const section = scroller?.querySelector<HTMLElement>(
      `[data-month="${key}"]`,
    )
    if (!scroller || !section) {
      return
    }
    const top =
      scroller.scrollTop +
      section.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top
    scroller.scrollTo({
      top: Math.max(0, top - 1),
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  const layout: Transition = reduce ? still : spring.smooth

  return (
    <MotionScope>
      <section
        data-slot="changelog-feed"
        aria-labelledby={`${uid}-title`}
        className={cn(
          '@container mx-auto w-full max-w-230 overflow-hidden rounded-3xl bg-surface text-fg shadow-sm',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-x-6 gap-y-4 px-7 pt-8 pb-5 @max-[640px]:flex-col @max-[640px]:px-5 @max-[640px]:pt-6.5 @max-[640px]:pb-6">
          <div className="min-w-0">
            <h2
              id={`${uid}-title`}
              className="font-heading text-3xl font-medium text-fg"
            >
              {title ?? messages.changelogTitle}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-7 pt-1.5 pb-5 @max-[640px]:px-5 @max-[640px]:pt-1 @max-[640px]:pb-4.5">
          <div
            role="group"
            aria-label={messages.changelogFilter}
            className="flex flex-wrap items-center gap-2"
          >
            {KINDS.map((kind) => (
              <ChangelogChip
                key={kind}
                label={kindLabel[kind]}
                count={entries.filter((entry) => entry.kind === kind).length}
                color={colorOf(kind)}
                pressed={filters.includes(kind)}
                onPressedChange={() => toggleFilter(kind)}
              />
            ))}
            <AnimatePresence initial={false}>
              {filters.length > 0 && (
                <motion.button
                  key="clear"
                  type="button"
                  onClick={() => setFilters([])}
                  className="h-9 rounded-full px-2 text-sm font-medium text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-solid max-md:h-11"
                  initial={{
                    opacity: 0,
                    x: -6,
                    filter: `blur(${blur.subtle}px)`,
                  }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{
                    opacity: 0,
                    x: -4,
                    filter: `blur(${blur.subtle}px)`,
                    transition: { duration: duration.instant },
                  }}
                  transition={reduce ? still : spring.snappy}
                >
                  {messages.changelogShowAll}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {/* Shown to the eye; the status below says it to a screen reader. */}
          <p
            aria-hidden="true"
            className="inline-flex items-baseline gap-1 text-sm whitespace-nowrap text-fg-subtle tabular-nums @max-[480px]:hidden"
          >
            <motion.span
              layout="position"
              transition={layout}
              className="inline-flex"
            >
              <RollingCount value={visible.length} />
            </motion.span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={filters.length === 0 ? 'all' : 'some'}
                className="inline-block"
                initial={{ opacity: 0, filter: `blur(${blur.subtle}px)` }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  transition: { duration: duration.instant },
                }}
                transition={reduce ? still : { duration: duration.standard }}
              >
                {filters.length === 0
                  ? messages.changelogUpdates(visible.length)
                  : messages.changelogOfTotal(total)}
              </motion.span>
            </AnimatePresence>
          </p>
          <p role="status" className="sr-only">
            {messages.changelogShowing(visible.length, total)}
          </p>
        </div>

        <div className="flex min-h-15 items-center justify-between gap-4 border-y border-line px-7 py-2.5 @max-[640px]:px-5">
          <div aria-hidden="true" className="flex min-w-0 items-baseline gap-3">
            <span className="relative inline-flex text-lg font-medium whitespace-nowrap @max-[480px]:text-base">
              <AnimatePresence
                mode="popLayout"
                initial={false}
                custom={active.direction}
              >
                <motion.span
                  key={current?.key ?? 'none'}
                  className="inline-block"
                  custom={active.direction}
                  variants={rise}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={reduce ? still : spring.morph}
                >
                  {current ? (
                    <>
                      {current.words.month}
                      <span className="@max-[480px]:hidden">
                        {' '}
                        {current.words.year}
                      </span>
                    </>
                  ) : (
                    messages.changelogNoUpdates
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
            {current && (
              <motion.span
                layout="position"
                transition={layout}
                className="inline-flex items-baseline gap-1 text-sm whitespace-nowrap text-fg-subtle tabular-nums @max-[480px]:hidden"
              >
                <RollingCount value={current.items.length} />
                {messages.changelogUpdates(current.items.length)}
              </motion.span>
            )}
          </div>
          <LayoutGroup id={`${uid}-months`}>
            <nav
              aria-label={messages.changelogMonths}
              className="flex shrink-0 gap-0.5 rounded-full bg-tray p-[3px]"
            >
              {groups.map((group) => {
                const selected = group.key === current?.key
                return (
                  <button
                    key={group.key}
                    type="button"
                    aria-label={messages.changelogJumpTo(group.words.label)}
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => jumpTo(group.key)}
                    className="relative h-7 min-w-10.5 rounded-full px-2.5 text-xs font-medium text-fg-muted transition-colors duration-(--motion-standard) ease-standard outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-solid aria-[current]:text-fg @max-[480px]:min-w-0 @max-[480px]:px-2"
                  >
                    {selected && (
                      <motion.span
                        layoutId="month-pill"
                        className="absolute inset-0 rounded-full bg-surface shadow-xs ring-1 ring-line"
                        transition={reduce ? still : spring.morph}
                      />
                    )}
                    <span className="relative">{group.words.short}</span>
                  </button>
                )
              })}
            </nav>
          </LayoutGroup>
        </div>

        <motion.div
          layoutScroll
          ref={scrollRef}
          onScroll={schedule}
          // A scrolling region: reachable with Tab, so the keyboard scrolls it.
          tabIndex={0}
          role="region"
          aria-label={messages.changelogList}
          className={cn(
            'relative overflow-y-auto overscroll-contain outline-none [scrollbar-width:thin] mask-b-from-[calc(100%-36px)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid',
            height === undefined && 'h-[560px] @max-[640px]:h-[520px]',
          )}
          style={height === undefined ? undefined : { height }}
        >
          <div ref={watchList} className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {groups.map((group, index) => (
                <motion.section
                  key={group.key}
                  data-month={group.key}
                  layout="position"
                  aria-labelledby={`${uid}-${group.key}`}
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: duration.exit },
                  }}
                  transition={{
                    layout,
                    opacity: {
                      duration: reduce ? duration.instant : duration.standard,
                    },
                  }}
                >
                  {/* The month bar names the first month already. */}
                  <h3
                    id={`${uid}-${group.key}`}
                    className={
                      index === 0
                        ? 'sr-only'
                        : 'border-b border-line-subtle px-7 pt-7.5 pb-2.5 font-sans text-sm font-medium text-fg-subtle @max-[640px]:px-5'
                    }
                  >
                    {group.words.label}
                  </h3>
                  <ul className="relative">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {group.items.map((entry) => (
                        <ChangelogEntry
                          key={entry.id}
                          date={entry.date}
                          version={entry.version}
                          kind={entry.kind}
                          color={colorOf(entry.kind)}
                          title={entry.title}
                          summary={entry.summary}
                          open={open.includes(entry.id)}
                          onOpenChange={(next) => setEntryOpen(entry.id, next)}
                        >
                          {entry.details?.length || entry.media ? (
                            <>
                              {entry.details && entry.details.length > 0 && (
                                <ul className="grid max-w-[62ch] gap-1.5">
                                  {entry.details.map((detail) => (
                                    <li
                                      key={detail}
                                      className="relative pl-4 before:absolute before:top-[0.75em] before:left-px before:h-px before:w-1.5 before:bg-fg-subtle"
                                    >
                                      {detail}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {entry.media && (
                                <ChangelogMediaView media={entry.media} />
                              )}
                            </>
                          ) : undefined}
                        </ChangelogEntry>
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.section>
              ))}
            </AnimatePresence>
            {endNote && (
              <motion.p
                layout="position"
                transition={{ layout }}
                className="px-7 pt-8 pb-14 text-center text-sm text-fg-subtle @max-[640px]:px-5"
              >
                {endNote}
              </motion.p>
            )}
          </div>
        </motion.div>
      </section>
    </MotionScope>
  )
}

export { ChangelogFeed }
export type { ChangelogFeedProps, ChangelogItem, ChangelogMedia }
