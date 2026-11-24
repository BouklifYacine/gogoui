import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AnimatePresence, animate, m, useMotionValue } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { cn } from '../lib/cn.ts'
import { GoGoIcon } from './gogo-icon.tsx'
import { blur, duration, ease } from './motion.ts'
import { flagOf, onlyDigits } from './phone-countries.ts'
import type { PhoneCountry } from './phone-countries.ts'
import { useElementSize } from './use-element-size.ts'

// Spring durations as stiffness and damping, so a retarget mid-flight keeps
// its speed. Opening is slower than closing.
const physical = (visualDuration: number) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: 'spring' as const, stiffness: root * root, damping: 2 * root }
}
const GROW = physical(0.3)
const SHRINK = physical(0.2)
const PANEL_MAX = 340
const CLOSED_RADIUS = 7
const OPEN_RADIUS = 16
const PAGE = 8

type Row = { key: string; entry: PhoneCountry }
type Section = { key: string; label?: string; rows: Row[] }

/** The words PhoneCountryPicker writes, to change on one PhoneCountryPicker only. */
type PhoneCountryPickerLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'phoneAllCountries'
    | 'phoneSuggested'
    | 'phoneCountry'
    | 'phoneSearch'
    | 'phoneSearchPlaceholder'
    | 'clearSearch'
    | 'phoneCloseList'
    | 'phoneCountries'
    | 'phoneNoCountry'
    | 'phoneCountryCount'
  >
>

type PhoneCountryPickerProps = {
  country: PhoneCountry
  pool: PhoneCountry[]
  preferred: PhoneCountry[]
  /** A country's name in the reader's language. */
  nameOf: (entry: PhoneCountry) => string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The search, seeded with « + » when « + » is typed in the number. */
  query: string
  onQueryChange: (query: string) => void
  onPick: (entry: PhoneCountry) => void
  /** Puts the focus back in the number. */
  onFocusNumber: () => void
  /** The field's width: the open list takes it, 340 px at most. */
  fieldWidth: number
  disabled?: boolean
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: PhoneCountryPickerLabels
}

/**
 * The country button of PhoneField, after Arc UI (https://uiarc.dev, MIT):
 * one surface whose width, height and corners spring from the button to
 * a searchable list, the highlight gliding from row to row.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary Internal: PhoneField's country button and list.
 */
export function PhoneCountryPicker({
  country,
  pool,
  preferred,
  nameOf,
  open,
  onOpenChange,
  query,
  onQueryChange,
  onPick,
  onFocusNumber,
  fieldWidth,
  disabled,
  labels,
}: PhoneCountryPickerProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const uid = useId()
  const listId = `${uid}-list`
  const optionId = (key: string) => `${uid}-option-${key}`

  const collator = new Intl.Collator(messages.intlLocale)
  const sorted = [...pool].sort((a, b) =>
    collator.compare(nameOf(a), nameOf(b)),
  )
  const needle = query.trim().toLowerCase()
  const matches = (entry: PhoneCountry) => {
    const digits = onlyDigits(needle)
    if (digits && /^[+\d\s()-]+$/.test(needle)) {
      return entry.dial.startsWith(digits) || digits.startsWith(entry.dial)
    }
    return (
      nameOf(entry).toLowerCase().includes(needle) ||
      entry.iso.toLowerCase() === needle
    )
  }
  let sections: Section[]
  if (needle && needle !== '+') {
    const digits = onlyDigits(needle)
    const hits = sorted.filter(matches)
    if (digits) {
      hits.sort(
        (a, b) =>
          Number(b.dial === digits) - Number(a.dial === digits) ||
          a.dial.length - b.dial.length,
      )
    }
    sections = [
      {
        key: 'results',
        rows: hits.map((entry) => ({ key: `r-${entry.iso}`, entry })),
      },
    ]
  } else {
    const all: Section = {
      key: 'all',
      label: preferred.length ? messages.phoneAllCountries : undefined,
      rows: sorted.map((entry) => ({ key: `a-${entry.iso}`, entry })),
    }
    sections = preferred.length
      ? [
          {
            key: 'preferred',
            label: messages.phoneSuggested,
            rows: preferred.map((entry) => ({ key: `p-${entry.iso}`, entry })),
          },
          all,
        ]
      : [all]
  }
  const rows = sections.flatMap((section) => section.rows)

  const [active, setActive] = useState<string | null>(null)
  const activeKey =
    active !== null && rows.some((row) => row.key === active)
      ? active
      : (rows[0]?.key ?? null)

  // Opening (from the button or from « + » in the number) starts on the
  // chosen country; the focus goes to the search once it shows.
  const pendingFocus = useRef<'trigger' | 'number' | null>(null)
  const shownOpen = useRef(false)
  const scrollIntent = useRef(false)
  const keyNav = useRef(false)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setActive(query ? null : `a-${country.iso}`)
    }
  }

  // The flag and the code roll the way the list goes.
  const order = sorted.findIndex((entry) => entry.iso === country.iso)
  const [trail, setTrail] = useState({ iso: country.iso, order, roll: 1 })
  if (trail.iso !== country.iso) {
    setTrail({
      iso: country.iso,
      order,
      roll: Math.sign(order - trail.order) || 1,
    })
  }

  const [measureSize, measureRef] = useElementSize<HTMLSpanElement>()
  const [anchorSize, anchorRef] = useElementSize<HTMLDivElement>()
  const [faceSize, faceRef] = useElementSize<HTMLDivElement>()
  const triggerWidth = measureSize?.width ?? 0
  const lidHeight = anchorSize?.height ?? 0
  const panelWidth = Math.min(PANEL_MAX, fieldWidth || PANEL_MAX)
  const shape = open
    ? {
        width: Math.max(triggerWidth, panelWidth),
        height: lidHeight + (faceSize?.height ?? 0),
        borderRadius: OPEN_RADIUS,
      }
    : { width: triggerWidth, height: lidHeight, borderRadius: CLOSED_RADIUS }

  const highlightY = useMotionValue(0)
  const highlightHeight = useMotionValue(0)
  const highlightOpacity = useMotionValue(0)
  const placed = useRef<{ top: number; height: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  /** The highlight on the active row: it glides under the pointer, jumps with the keys. */
  function placeHighlight(node: HTMLElement) {
    const top = node.offsetTop
    const height = node.offsetHeight
    const last = placed.current
    if (last && last.top === top && last.height === height) {
      return
    }
    if (!last || reduce || keyNav.current) {
      highlightY.jump(top)
      highlightHeight.jump(height)
    } else {
      animate(highlightY, top, GROW)
      animate(highlightHeight, height, GROW)
    }
    placed.current = { top, height }
    highlightOpacity.set(1)
    const scroller = scrollRef.current
    if (scroller && scrollIntent.current) {
      scrollIntent.current = false
      const pad = 6
      if (top < scroller.scrollTop + pad) {
        scroller.scrollTop = top - pad
      } else if (
        top + height >
        scroller.scrollTop + scroller.clientHeight - pad
      ) {
        scroller.scrollTop = top + height - scroller.clientHeight + pad
      }
    }
  }

  // Runs after each render (a ref given anew each time): moves the focus
  // the last action asked for, and hides the highlight when nothing is
  // active.
  function afterRender(node: HTMLDivElement | null) {
    if (!node) {
      return
    }
    if (open && !shownOpen.current) {
      searchRef.current?.focus({ preventScroll: true })
      // The chosen country in view.
      const row = node.querySelector<HTMLElement>('[data-active]')
      const scroller = scrollRef.current
      if (row && scroller) {
        scroller.scrollTop = Math.max(
          0,
          row.offsetTop - scroller.clientHeight / 2 + row.offsetHeight / 2,
        )
      }
    }
    shownOpen.current = open
    const target = pendingFocus.current
    pendingFocus.current = null
    if (target === 'trigger') {
      triggerRef.current?.focus({ preventScroll: true })
    } else if (target === 'number') {
      onFocusNumber()
    }
    if (!open || activeKey === null) {
      placed.current = null
      highlightOpacity.set(0)
    }
  }

  function close(focus: 'trigger' | 'number' | null) {
    pendingFocus.current = focus
    onOpenChange(false)
  }

  function pick(entry: PhoneCountry | undefined) {
    if (!entry) {
      return
    }
    onPick(entry)
    close('number')
  }

  function move(key: string | undefined) {
    if (!key) {
      return
    }
    scrollIntent.current = true
    keyNav.current = true
    setActive(key)
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const at = rows.findIndex((row) => row.key === activeKey)
    const go = (index: number) => {
      event.preventDefault()
      move(rows[Math.max(0, Math.min(rows.length - 1, index))]?.key)
    }
    switch (event.key) {
      case 'ArrowDown':
        go(at + 1)
        return
      case 'ArrowUp':
        go(at - 1)
        return
      case 'PageDown':
        go(at + PAGE)
        return
      case 'PageUp':
        go(at - PAGE)
        return
      case 'Home':
      case 'End':
        if (!query) {
          go(event.key === 'Home' ? 0 : rows.length - 1)
        }
        return
      case 'Enter':
        event.preventDefault()
        pick(rows[at]?.entry)
        return
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close('trigger')
        return
      case 'Tab':
        close(null)
        return
    }
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      onQueryChange('')
      onOpenChange(true)
    } else if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      // A letter typed on the button starts the search with it.
      event.preventDefault()
      onQueryChange(event.key)
      onOpenChange(true)
    }
  }

  function onQuery(next: string) {
    onQueryChange(next)
    keyNav.current = true
    setActive(null)
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }

  // A press outside closes the list; listening only while it is open.
  function listenOutside(node: HTMLDivElement | null) {
    if (!node) {
      return undefined
    }
    const down = (event: PointerEvent) => {
      const picker = node.closest('[data-slot="phone-country-picker"]')
      if (!picker?.contains(event.target as Node)) {
        close(null)
      }
    }
    document.addEventListener('pointerdown', down)
    return () => document.removeEventListener('pointerdown', down)
  }

  const count = needle && needle !== '+' ? rows.length : null
  const face = (entry: PhoneCountry) => (
    <>
      <span
        aria-hidden="true"
        className="inline-grid w-5 shrink-0 place-items-center font-[family-name:Apple_Color_Emoji,Segoe_UI_Emoji,Noto_Color_Emoji,sans-serif] text-[17px] leading-none font-normal"
      >
        {flagOf(entry.iso)}
      </span>
      <span className="tabular-nums">+{entry.dial}</span>
    </>
  )
  const layer = {
    enter: (dir: number) => ({
      opacity: 0,
      y: `${dir * 0.6}em`,
      filter: `blur(${blur.soft}px)`,
    }),
    rest: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transitionEnd: { filter: 'none' },
    },
    exit: (dir: number) => ({
      opacity: 0,
      y: `${dir * -0.5}em`,
      filter: `blur(${blur.subtle}px)`,
      transition: { duration: duration.instant, ease: ease.standard },
    }),
  }
  const layerFade = {
    enter: { opacity: 0 },
    rest: { opacity: 1, y: 0, filter: 'none' },
    exit: { opacity: 0, transition: { duration: duration.instant } },
  }

  return (
    <div
      ref={anchorRef}
      data-slot="phone-country-picker"
      data-open={open ? '' : undefined}
      className="group/picker relative h-full flex-none after:absolute after:inset-y-2.5 after:right-0 after:w-px after:bg-line after:transition-opacity data-open:z-30 data-open:after:opacity-0"
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null
        if (open && next && !event.currentTarget.contains(next)) {
          close(null)
        }
      }}
    >
      {/* Sizes the closed button, so the spring has a target. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible flex h-full w-max items-center gap-1.5 pr-9 pl-3 text-sm font-medium whitespace-nowrap"
      >
        {face(country)}
      </span>

      <m.div
        ref={afterRender}
        // Fills the anchor until it is measured, then springs its own size.
        className="absolute inset-0 z-10 overflow-clip bg-field transition-[background-color,box-shadow] duration-200 ease-standard group-data-open/picker:bg-floating group-data-open/picker:shadow-menu"
        initial={false}
        animate={triggerWidth && lidHeight ? shape : undefined}
        transition={reduce ? { duration: 0 } : open ? GROW : SHRINK}
      >
        <div
          className="absolute inset-x-0 top-0 z-10"
          style={{ height: lidHeight || '100%' }}
        >
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            inert={open || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={messages.phoneCountry(nameOf(country), country.dial)}
            onClick={() => {
              onQueryChange('')
              onOpenChange(!open)
            }}
            onKeyDown={onTriggerKeyDown}
            className="absolute inset-0.5 flex items-center rounded-[5px] pr-8.5 pl-2.5 text-sm font-medium text-fg outline-none transition-colors duration-150 ease-standard hover:bg-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <span
              className={cn(
                'relative block h-full min-w-0 flex-1 transition-opacity duration-100',
                open && 'opacity-0',
              )}
            >
              <AnimatePresence initial={false} custom={trail.roll}>
                <m.span
                  key={country.iso}
                  custom={trail.roll}
                  variants={reduce ? layerFade : layer}
                  initial="enter"
                  animate="rest"
                  exit="exit"
                  transition={
                    reduce
                      ? { duration: duration.instant }
                      : {
                          y: GROW,
                          opacity: {
                            duration: duration.standard,
                            ease: ease.enter,
                          },
                          filter: {
                            duration: duration.standard,
                            ease: ease.enter,
                          },
                        }
                  }
                  className="absolute inset-0 flex items-center gap-1.5"
                >
                  {face(country)}
                </m.span>
              </AnimatePresence>
            </span>
          </button>

          <m.div
            ref={open ? listenOutside : undefined}
            inert={!open || undefined}
            className="absolute inset-0 flex items-center gap-2 pr-0.5 pl-3"
            initial={false}
            animate={
              open
                ? { opacity: 1, filter: 'blur(0px)' }
                : {
                    opacity: 0,
                    filter: reduce ? 'blur(0px)' : `blur(${blur.subtle}px)`,
                  }
            }
            transition={
              open
                ? {
                    duration: duration.fast,
                    ease: ease.enter,
                    delay: reduce ? 0 : 0.05,
                  }
                : { duration: duration.instant, ease: ease.standard }
            }
          >
            <GoGoIcon
              name="search"
              aria-hidden="true"
              className="size-4 shrink-0 text-fg-subtle"
            />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-label={messages.phoneSearch}
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                open && activeKey ? optionId(activeKey) : undefined
              }
              placeholder={messages.phoneSearchPlaceholder}
              value={query}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => onQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              className="h-full min-w-0 flex-1 bg-transparent p-0 text-sm text-fg outline-none placeholder:text-fg-subtle max-md:text-[16px]"
            />
            <AnimatePresence initial={false}>
              {query && (
                <m.button
                  key="clear"
                  type="button"
                  aria-label={messages.clearSearch}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onQuery('')
                    searchRef.current?.focus()
                  }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.7,
                    transition: { duration: duration.instant },
                  }}
                  transition={reduce ? { duration: 0 } : GROW}
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-hover text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus [&_svg]:size-3.5"
                >
                  <GoGoIcon name="close" aria-hidden="true" />
                </m.button>
              )}
            </AnimatePresence>
            {/* Over the chevron: the chevron closes the list. */}
            <button
              type="button"
              aria-label={messages.phoneCloseList}
              onClick={() => close('trigger')}
              className="size-8 shrink-0 rounded-full outline-none hover:bg-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus"
            />
          </m.div>

          <m.span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 grid size-4 -translate-y-1/2 place-items-center text-fg-subtle [&_svg]:size-4"
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : GROW}
          >
            <GoGoIcon name="chevronDown" />
          </m.span>
        </div>

        <m.div
          ref={faceRef}
          inert={!open || undefined}
          aria-hidden={!open || undefined}
          className="absolute left-0 px-1.5 pb-1.5 before:absolute before:inset-x-3.5 before:top-0 before:h-px before:bg-line-subtle"
          style={{ top: lidHeight, width: panelWidth }}
          initial={false}
          animate={
            open
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : {
                  opacity: 0,
                  y: reduce ? 0 : -6,
                  filter: reduce ? 'blur(0px)' : `blur(${blur.subtle}px)`,
                }
          }
          transition={
            open
              ? {
                  y: GROW,
                  opacity: {
                    duration: duration.standard,
                    ease: ease.enter,
                    delay: reduce ? 0 : 0.04,
                  },
                  filter: {
                    duration: duration.standard,
                    ease: ease.enter,
                    delay: 0.04,
                  },
                }
              : { duration: duration.instant, ease: ease.standard }
          }
        >
          <div
            ref={scrollRef}
            className="max-h-70 overflow-y-auto overscroll-contain pt-1.5 [scrollbar-width:thin]"
          >
            <div
              id={listId}
              role="listbox"
              aria-label={messages.phoneCountries}
              className="relative grid gap-0.5"
            >
              <m.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 rounded-[10px] bg-menu-highlight"
                style={{
                  y: highlightY,
                  height: highlightHeight,
                  opacity: highlightOpacity,
                }}
              />
              {sections.map((section) => {
                const body = section.rows.map((row) => {
                  const selected = row.entry.iso === country.iso
                  const isActive = row.key === activeKey
                  return (
                    <div
                      key={row.key}
                      id={optionId(row.key)}
                      role="option"
                      aria-selected={selected}
                      data-active={isActive ? '' : undefined}
                      ref={(node) => {
                        if (node && isActive && open) {
                          placeHighlight(node)
                        }
                      }}
                      onPointerMove={(event) => {
                        if (event.pointerType !== 'mouse') {
                          return
                        }
                        keyNav.current = false
                        if (!isActive) {
                          setActive(row.key)
                        }
                      }}
                      tabIndex={-1}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => pick(row.entry)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          pick(row.entry)
                        }
                      }}
                      className="relative flex min-h-9 cursor-default items-center gap-2.5 rounded-[10px] px-2.5 text-sm text-fg-muted transition-colors duration-150 ease-standard select-none data-active:text-fg aria-selected:text-fg max-md:min-h-11"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-grid w-5 shrink-0 place-items-center font-[family-name:Apple_Color_Emoji,Segoe_UI_Emoji,Noto_Color_Emoji,sans-serif] text-[17px] leading-none"
                      >
                        {flagOf(row.entry.iso)}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {nameOf(row.entry)}
                      </span>
                      <span className="shrink-0 text-xs text-fg-subtle tabular-nums">
                        +{row.entry.dial}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid size-4 shrink-0 place-items-center text-fg transition-[opacity,scale] duration-150 ease-standard [&_svg]:size-4',
                          selected
                            ? 'scale-100 opacity-100'
                            : 'scale-60 opacity-0',
                        )}
                      >
                        <GoGoIcon name="check" />
                      </span>
                    </div>
                  )
                })
                return section.label ? (
                  <div
                    key={section.key}
                    role="group"
                    aria-labelledby={`${uid}-${section.key}`}
                    className="grid gap-0.5 not-first:mt-1"
                  >
                    <div
                      id={`${uid}-${section.key}`}
                      role="presentation"
                      className="px-2.5 pt-2 pb-1 text-xs text-fg-subtle"
                    >
                      {section.label}
                    </div>
                    {body}
                  </div>
                ) : (
                  <div
                    key={section.key}
                    role="presentation"
                    className="grid gap-0.5"
                  >
                    {body}
                  </div>
                )
              })}
              {rows.length === 0 && (
                <p className="m-0 px-2.5 pt-3 pb-3.5 text-sm text-fg-subtle">
                  {messages.phoneNoCountry(query.trim())}
                </p>
              )}
            </div>
          </div>
        </m.div>
      </m.div>
      <span className="sr-only" role="status" aria-live="polite">
        {open && count !== null
          ? count === 0
            ? messages.phoneNoCountry(query.trim())
            : messages.phoneCountryCount(count)
          : ''}
      </span>
    </div>
  )
}
export type { PhoneCountryPickerLabels }
