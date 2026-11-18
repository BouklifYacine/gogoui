import { useCallback, useRef, useState } from 'react'
import type { FocusEvent } from 'react'
import { flushSync } from 'react-dom'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'
import { Kbd } from './kbd.tsx'

// The pill stretching into a field: a little bounce, no long tail.
const stretch = { type: 'spring', stiffness: 300, damping: 28 } as const
// The words leaving and arriving inside it, blurred on the way.
const swap = { duration: 0.18, ease: [0.23, 1, 0.32, 1] } as const
const enter = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { ...swap, delay: 0.06 },
  },
  exit: { opacity: 0, filter: 'blur(4px)', transition: swap },
  // Without it, the pill's scale would squash the glass and the words.
  layout: 'position',
  transition: { layout: stretch },
} as const

// Typing somewhere else: the « / » is a character there, not a shortcut.
function typing(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  )
}

// A dialog open that the search is not inside: the list is behind it.
function windowOver(search: HTMLElement) {
  const dialogs = document.querySelectorAll(
    '[role="dialog"], [role="alertdialog"]',
  )
  return [...dialogs].some((dialog) => !dialog.contains(search))
}

type ExpandingSearchProps = {
  /** The field's id; the closed pill is `${id}-glass`. */
  id: string
  /** What is searched, for screen readers (« Rechercher un client »). */
  label: string
  /** The closed pill's name, the label by default. */
  glassLabel?: string
  value: string
  onValueChange: (text: string) => void
}

/**
 * A list's search on its toolbar: a pill « Rechercher / » that stretches
 * open into a field, on a click or the « / » key anywhere on the page.
 * Escape, or the focus leaving it, folds it back; while a search is typed
 * the closed pill shows it. On a phone the pill is the glass alone. The
 * page decides what a search does.
 *
 * @summary A search pill that opens into a field, also on « / ».
 */
function ExpandingSearch({
  id,
  label,
  glassLabel,
  value,
  onValueChange,
}: ExpandingSearchProps) {
  const messages = useGoGoUIMessages()
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const container = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const glass = useRef<HTMLButtonElement>(null)
  const query = value.trim()

  // The field exists only open: rendered first, then focused.
  function openField() {
    flushSync(() => setOpen(true))
    input.current?.focus()
  }

  function closeToGlass() {
    flushSync(() => setOpen(false))
    glass.current?.focus()
  }

  // Closed once the focus has left the search as a whole: Tab from the
  // field to its × keeps it open.
  function closeIfLeft(event: FocusEvent) {
    if (!container.current?.contains(event.relatedTarget)) {
      setOpen(false)
    }
  }

  // « / » opens the search, unless typing elsewhere, the search is hidden,
  // or a dialog is open over it. A callback ref: listening starts with the
  // search and stops with it.
  const listenForSlash = useCallback((node: HTMLElement | null) => {
    container.current = node
    if (!node) {
      return undefined
    }
    function onKey(event: KeyboardEvent) {
      if (
        event.key !== '/' ||
        event.defaultPrevented ||
        input.current ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        typing(event.target) ||
        !node?.offsetParent ||
        windowOver(node)
      ) {
        return
      }
      event.preventDefault()
      openField()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <search
        ref={listenForSlash}
        data-slot="expanding-search"
        className="max-w-full min-w-0 shrink-0"
      >
        <motion.div
          layout
          transition={{ layout: reduce ? { duration: 0 } : stretch }}
          // Corners in style: Motion keeps them round while it stretches.
          style={{ borderRadius: 18 }}
          className={cn(
            'flex h-9 items-center overflow-hidden bg-control text-sm font-medium text-fg shadow-button',
            open ? 'w-60 max-w-full' : 'hover:bg-control-hover',
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {open ? (
              <motion.div
                key="field"
                {...enter}
                className="relative flex w-full items-center gap-2 ps-3 pe-1.5"
              >
                <GoGoIcon
                  name="search"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-fg-subtle"
                />
                <label htmlFor={id} className="sr-only">
                  {label}
                </label>
                <input
                  ref={input}
                  id={id}
                  type="search"
                  value={value}
                  onChange={(event) => onValueChange(event.target.value)}
                  onBlur={closeIfLeft}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      closeToGlass()
                    }
                  }}
                  placeholder={messages.searchPlaceholder}
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent font-normal text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:appearance-none"
                />
                {value ? (
                  <button
                    type="button"
                    // A click keeps the focus in the field; Tab reaches it.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onValueChange('')
                      input.current?.focus()
                    }}
                    onBlur={closeIfLeft}
                    // 28 px, with a 44 px touch target around it.
                    className="relative flex size-7 shrink-0 items-center justify-center rounded-full text-fg outline-line-focus after:absolute after:-inset-2 hover:bg-hover focus-visible:outline-2"
                  >
                    <GoGoIcon
                      name="close"
                      aria-hidden="true"
                      weight="bold"
                      className="size-3.5"
                    />
                    <span className="sr-only">{messages.clearSearch}</span>
                  </button>
                ) : (
                  <Kbd aria-hidden="true" className="pointer-coarse:hidden">
                    {messages.escapeKey}
                  </Kbd>
                )}
              </motion.div>
            ) : (
              <motion.button
                key="pill"
                ref={glass}
                id={`${id}-glass`}
                type="button"
                {...enter}
                aria-expanded={false}
                aria-controls={id}
                aria-keyshortcuts="/"
                onClick={openField}
                className={cn(
                  'flex h-9 cursor-pointer items-center gap-2 rounded-[18px] whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus',
                  'max-sm:w-9 max-sm:justify-center sm:ps-3 sm:pe-2',
                  query && 'bg-primary-subtle text-fg',
                )}
              >
                <GoGoIcon
                  name="search"
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0',
                    query ? 'text-fg' : 'text-fg-subtle',
                  )}
                />
                <span
                  aria-hidden="true"
                  className="max-w-32 truncate max-sm:hidden"
                >
                  {query || messages.search}
                </span>
                {!query && (
                  <Kbd
                    aria-hidden="true"
                    className="max-sm:hidden pointer-coarse:hidden"
                  >
                    /
                  </Kbd>
                )}
                <span className="sr-only">
                  {query ? messages.searchQuery(query) : (glassLabel ?? label)}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </search>
    </MotionConfig>
  )
}

export { ExpandingSearch }
export type { ExpandingSearchProps }
