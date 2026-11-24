import { useCallback, useId, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, ReactNode, Ref, UIEvent } from 'react'
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { subtle } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { MenuHighlight } from '../internal/menu-highlight.tsx'
import { menuPanel, menuRow } from '../internal/menu-styles.ts'
import { MentionMatch } from '../internal/mention-match.tsx'
import {
  emptyMentionValue,
  findMentionTrigger,
  mentionText,
  rankMention,
  reconcileMentions,
  serializeMentions,
} from '../internal/mentions.ts'
import type {
  Mention,
  MentionPerson,
  MentionValue,
} from '../internal/mentions.ts'
import { duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'
import { PersonAvatar } from './person-avatar.tsx'

type MentionInputProps = {
  /** The text and its mentions, when the page keeps them. */
  value?: MentionValue
  defaultValue?: MentionValue
  onValueChange?: (value: MentionValue) => void
  /** The people offered after @. */
  people: MentionPerson[]
  /** Called when a suggestion becomes a mention (to notify that person). */
  onMentionAdd?: (mention: Mention) => void
  /** With `submitOnEnter`, Enter sends and Shift+Enter adds a line. */
  onSubmit?: (value: MentionValue) => void
  submitOnEnter?: boolean
  onBlur?: () => void
  placeholder?: string
  /** Lines shown while empty. */
  minRows?: number
  /** It grows to this many lines, then scrolls. */
  maxRows?: number
  /** Where the list opens; `auto` goes above when there is no room below. */
  side?: 'auto' | 'top' | 'bottom'
  maxSuggestions?: number
  disabled?: boolean
  /** The mentions' tint; primary by default. */
  color?: Color
  /** The text area, to focus it from the page. */
  ref?: Ref<HTMLTextAreaElement>
  id?: string
  name?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  className?: string
}

const LIST_WIDTH = 272
// The text and its mirror share every measure, so each tinted mention
// sits exactly under its letters.
const metrics =
  'm-0 box-border w-full border-0 px-3 py-1.5 text-sm leading-6 whitespace-pre-wrap wrap-break-word [tab-size:4] max-md:text-[16px]'

type Anchor = { x: number; y: number; above: boolean }

/**
 * A text of several lines where @ mentions a person, after Arc UI
 * (https://uiarc.dev, MIT).
 *
 * **Prefer** `MentionField` in a form (label, help, error). **Not for**
 * rich text (`RichTextEditor`).
 *
 * **Use it for** a note that cites a team member, a comment.
 *
 * **States**: empty, typing, list open (people, or « Aucune personne ne
 * correspond »), mentions in the text, invalid, disabled. The height
 * follows the text on a spring between `minRows` and `maxRows`; the list
 * grows from the @ (above it when there is no room below); its highlight
 * glides under the pointer; the typed part of each name is in full
 * colour. A mention is one block: the caret steps over it and one
 * Backspace removes it (Ctrl+Z brings it back).
 *
 * **Key props**: `value` + `onValueChange` (`{ text, mentions }`),
 * `people` (`{ id, name, description?, avatarSrc? }`), `onMentionAdd`,
 * `onSubmit` + `submitOnEnter`, `minRows`, `maxRows`, `side`, `color`.
 * `serializeMentions(value)` writes `<@id>` for storage.
 *
 * **Accessibility**: the text area is a combobox: ↑ ↓ move in the list,
 * Enter or Tab chooses, Escape closes; the number of people is read
 * politely. With reduced motion nothing slides.
 *
 * @summary A text of several lines where @ mentions a person.
 */
function MentionInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  people,
  onMentionAdd,
  onSubmit,
  submitOnEnter = false,
  onBlur,
  placeholder,
  minRows = 2,
  maxRows = 8,
  side = 'auto',
  maxSuggestions = 6,
  disabled,
  color = 'primary',
  ref,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
}: MentionInputProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const uid = useId()
  const listId = `${uid}-list`
  const optionId = (index: number) => `${uid}-option-${index}`

  const [inner, setInner] = useState<MentionValue>(
    defaultValue ?? emptyMentionValue,
  )
  const value = valueProp ?? inner
  const [caret, setCaret] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState<number | null>(null)
  const [active, setActive] = useState(0)
  const [anchor, setAnchor] = useState<Anchor | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLTextAreaElement | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const lastCaret = useRef(0)
  const pending = useRef<Mention | null>(null)
  // The value just committed, read by handlers that run before the next
  // render (the selection right after an edit).
  const committed = useRef<{ from: MentionValue; to: MentionValue } | null>(
    null,
  )
  const height = useMotionValue<number | 'auto'>('auto')

  const current = () =>
    committed.current && committed.current.from === value
      ? committed.current.to
      : value

  const trigger =
    caret === null
      ? null
      : findMentionTrigger(value.text, caret, value.mentions)
  const query = trigger?.query.toLowerCase().trim() ?? ''
  const suggestions = trigger
    ? people
        .map((person) => ({ person, score: rankMention(person, query) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSuggestions)
        .map((entry) => entry.person)
    : []

  // A sentence that simply goes on after an unknown name closes the list
  // instead of showing « no one ».
  const open =
    focused &&
    !disabled &&
    trigger !== null &&
    trigger.start !== dismissed &&
    (suggestions.length > 0 || !trigger.query.includes(' '))
  const activeIndex = Math.min(active, Math.max(0, suggestions.length - 1))

  // Decided during the render: a new query highlights the first person,
  // a new @ forgets an Escape, a closed list forgets where it hung.
  const queryKey = trigger ? `${trigger.start}:${trigger.query}` : ''
  const [lastQueryKey, setLastQueryKey] = useState(queryKey)
  if (lastQueryKey !== queryKey) {
    setLastQueryKey(queryKey)
    setActive(0)
  }
  if (dismissed !== null && trigger?.start !== dismissed) {
    setDismissed(null)
  }
  if (!open && anchor !== null) {
    setAnchor(null)
  }

  function commit(next: MentionValue) {
    committed.current = { from: value, to: next }
    if (valueProp === undefined) {
      setInner(next)
    }
    onValueChange?.(next)
  }

  const setArea = useCallback(
    (node: HTMLTextAreaElement | null) => {
      areaRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref],
  )

  // The mirror carries the text, so its height is the text's: the field
  // springs to it, within its rows.
  const followText = useCallback(
    (backdrop: HTMLDivElement | null) => {
      backdropRef.current = backdrop
      if (!backdrop) {
        return undefined
      }
      const style = getComputedStyle(backdrop)
      const line = Number.parseFloat(style.lineHeight) || 24
      const pad =
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom)
      const min = line * minRows + pad
      const max = line * Math.max(minRows, maxRows) + pad
      let placed = false
      const fit = () => {
        const target = Math.min(max, Math.max(min, backdrop.offsetHeight))
        const now = height.get()
        if (!placed || reduce || typeof now !== 'number') {
          height.jump(target)
          placed = true
        } else if (Math.abs(now - target) > 0.5) {
          animate(height, target, spring.smooth)
        }
      }
      fit()
      if (typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const observer = new ResizeObserver(fit)
      observer.observe(backdrop)
      return () => observer.disconnect()
    },
    [height, minRows, maxRows, reduce],
  )

  // The list hangs from the @, measured from a marker in the mirror.
  const measureAnchor = useCallback(
    (marker: HTMLElement | null | undefined) => {
      const root = rootRef.current
      const field = fieldRef.current
      const area = areaRef.current
      if (!marker || !root || !field || !area) {
        return
      }
      const line =
        Number.parseFloat(
          getComputedStyle(marker.parentElement ?? marker).lineHeight,
        ) || 24
      const x = Math.max(
        0,
        Math.min(
          field.offsetLeft + marker.offsetLeft - 10,
          root.offsetWidth - LIST_WIDTH,
        ),
      )
      const top = field.offsetTop + marker.offsetTop - area.scrollTop
      const box = root.getBoundingClientRect()
      const roomBelow = window.innerHeight - (box.top + top + line)
      const above =
        side === 'top' ||
        (side === 'auto' && roomBelow < 300 && box.top + top > roomBelow)
      const y = above ? top - 6 : top + line + 6
      setAnchor((previous) =>
        previous &&
        previous.x === x &&
        previous.y === y &&
        previous.above === above
          ? previous
          : { x, y, above },
      )
    },
    [side],
  )

  // The caret never rests inside a mention: arrows hop over it, a click
  // lands on its nearest edge.
  function onSelect() {
    const area = areaRef.current
    if (!area) {
      return
    }
    let start = area.selectionStart
    let end = area.selectionEnd
    const collapsed = start === end
    for (const mention of current().mentions) {
      if (collapsed && start > mention.start && start < mention.end) {
        const stepped = Math.abs(start - lastCaret.current) === 1
        const forward = start > lastCaret.current
        start = end = stepped
          ? forward
            ? mention.end
            : mention.start
          : start - mention.start < mention.end - start
            ? mention.start
            : mention.end
      } else if (!collapsed) {
        if (start > mention.start && start < mention.end) {
          start = mention.start
        }
        if (end > mention.start && end < mention.end) {
          end = mention.end
        }
      }
    }
    if (start !== area.selectionStart || end !== area.selectionEnd) {
      area.setSelectionRange(start, end, area.selectionDirection)
    }
    lastCaret.current = area.selectionStart
    setCaret(collapsed ? start : null)
  }

  function accept(text: string, start: number, end: number) {
    const previous = current()
    const mentions = reconcileMentions(previous, text, lastCaret.current)
    const added = pending.current
    pending.current = null
    if (
      added &&
      text.slice(added.start, added.end) === mentionText(added.label)
    ) {
      mentions.push(added)
      mentions.sort((a, b) => a.start - b.start)
    }
    commit({ text, mentions })
    if (added) {
      onMentionAdd?.(added)
    }
    lastCaret.current = start
    setCaret(start === end ? start : null)
  }

  function onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const area = event.target
    accept(area.value, area.selectionStart, area.selectionEnd)
  }

  // Types through the browser, so the change joins its undo history;
  // writes directly where it cannot.
  function typeText(text: string, from: number, to: number) {
    const area = areaRef.current
    if (!area) {
      return
    }
    area.focus({ preventScroll: true })
    area.setSelectionRange(from, to)
    lastCaret.current = from
    const typed =
      typeof document.execCommand === 'function' &&
      document.execCommand('insertText', false, text)
    if (typed) {
      return
    }
    const previous = current().text
    const next = previous.slice(0, from) + text + previous.slice(to)
    accept(next, from + text.length, from + text.length)
    requestAnimationFrame(() =>
      area.setSelectionRange(from + text.length, from + text.length),
    )
  }

  function choose(person: MentionPerson | undefined) {
    if (!person || !trigger || caret === null) {
      return
    }
    const token = mentionText(person.name)
    pending.current = {
      id: person.id,
      label: person.name,
      start: trigger.start,
      end: trigger.start + token.length,
    }
    const after = value.text[caret]
    typeText(
      after === undefined || !/\s/.test(after) ? `${token} ` : token,
      trigger.start,
      caret,
    )
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const area = event.currentTarget
    lastCaret.current = area.selectionStart
    if (open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (suggestions.length > 0) {
          const step = event.key === 'ArrowDown' ? 1 : -1
          setActive(
            (activeIndex + step + suggestions.length) % suggestions.length,
          )
        }
        return
      }
      if (
        (event.key === 'Enter' || event.key === 'Tab') &&
        suggestions.length > 0 &&
        !event.shiftKey
      ) {
        event.preventDefault()
        choose(suggestions[activeIndex])
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setDismissed(trigger?.start ?? null)
        return
      }
    }
    const start = area.selectionStart
    if (
      start === area.selectionEnd &&
      !event.metaKey &&
      (event.key === 'Backspace' || event.key === 'Delete')
    ) {
      // Selects the whole mention and lets the browser delete it: one key
      // removes it, and undo brings it back.
      const hit = current().mentions.find((mention) =>
        event.key === 'Backspace'
          ? start > mention.start && start <= mention.end
          : start >= mention.start && start < mention.end,
      )
      if (hit) {
        area.setSelectionRange(hit.start, hit.end)
      }
      return
    }
    if (
      event.key === 'Enter' &&
      submitOnEnter &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      if (current().text.trim()) {
        onSubmit?.(current())
      }
    }
  }

  function onScroll(event: UIEvent<HTMLTextAreaElement>) {
    const backdrop = backdropRef.current
    if (backdrop) {
      backdrop.style.transform = `translateY(${-event.currentTarget.scrollTop}px)`
      measureAnchor(backdrop.querySelector<HTMLElement>('[data-anchor]'))
    }
  }

  // The mirror: the same text, mentions tinted in place, a marker at the
  // open @.
  const markAt = open && trigger ? trigger.start : -1
  const mirror: ReactNode[] = []
  let at = 0
  const pushText = (from: number, to: number) => {
    if (markAt >= from && markAt < to) {
      mirror.push(
        value.text.slice(from, markAt),
        <span key={`anchor-${markAt}`} ref={measureAnchor} data-anchor="" />,
        value.text.slice(markAt, to),
      )
    } else {
      mirror.push(value.text.slice(from, to))
    }
  }
  for (const mention of value.mentions) {
    pushText(at, mention.start)
    mirror.push(
      <span
        key={`${mention.start}-${mention.id}`}
        className={cn(
          '-mx-[3px] rounded-md px-[3px] py-px box-decoration-clone',
          subtle[color],
        )}
      >
        {value.text.slice(mention.start, mention.end)}
      </span>,
    )
    at = mention.end
  }
  pushText(at, value.text.length)

  const popIn = reduce
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.96, y: anchor?.above ? 4 : -4 }
  const countLabel = open
    ? suggestions.length > 0
      ? messages.mentionCount(suggestions.length)
      : messages.mentionNoMatch(trigger?.query ?? '')
    : ''
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <MotionScope>
      <div
        ref={rootRef}
        data-slot="mention-input"
        data-disabled={disabled || undefined}
        className={cn('relative w-full data-disabled:opacity-60', className)}
      >
        <motion.div
          ref={fieldRef}
          style={{ height }}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          className="relative overflow-hidden rounded-lg bg-field text-fg shadow-field ring-1 ring-field-line ring-inset transition-[box-shadow] duration-150 ease-standard focus-within:ring-line-focus hover:ring-fg-subtle forced-colors:border data-disabled:bg-subtle data-disabled:shadow-none data-invalid:ring-danger motion-reduce:transition-none"
        >
          <div
            ref={followText}
            aria-hidden="true"
            className={cn(
              metrics,
              'pointer-events-none absolute top-0 left-0 text-fg will-change-transform',
            )}
          >
            {mirror}
            {'​'}
          </div>
          <textarea
            ref={setArea}
            id={id}
            name={name}
            value={value.text}
            placeholder={placeholder}
            disabled={disabled}
            rows={minRows}
            spellCheck
            // A textarea keeps its own role (textbox): ARIA forbids combobox
            // on it. The list still follows it through activedescendant.
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={invalid || undefined}
            aria-autocomplete="list"
            aria-controls={open ? listId : undefined}
            aria-activedescendant={
              open && suggestions.length > 0 ? optionId(activeIndex) : undefined
            }
            onChange={onChange}
            onSelect={onSelect}
            onKeyDown={onKeyDown}
            onScroll={onScroll}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              setCaret(null)
              onBlur?.()
            }}
            className={cn(
              metrics,
              'absolute inset-0 block h-full resize-none overflow-y-auto bg-transparent text-transparent caret-fg outline-none [-webkit-text-fill-color:transparent] [scrollbar-width:none] selection:bg-primary/25 placeholder:text-fg-subtle placeholder:[-webkit-text-fill-color:var(--color-fg-subtle)] disabled:cursor-not-allowed [&::-webkit-scrollbar]:hidden',
            )}
          />
        </motion.div>
        <span aria-live="polite" className="sr-only">
          {countLabel}
        </span>
        <AnimatePresence>
          {open && anchor ? (
            <motion.div
              key={trigger?.start}
              data-above={anchor.above || undefined}
              style={{
                left: anchor.x,
                top: anchor.y,
                transformOrigin: anchor.above ? '14px 100%' : '14px 0',
              }}
              initial={popIn}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: reduce
                  ? { duration: duration.fast }
                  : {
                      ...spring.snappy,
                      opacity: { duration: duration.fast, ease: ease.enter },
                    },
              }}
              exit={{
                ...popIn,
                transition: {
                  duration: duration.exit * 0.7,
                  ease: ease.standard,
                },
              }}
              // The text area keeps the focus while the pointer chooses.
              onMouseDown={(event) => event.preventDefault()}
              className="absolute z-50 w-68 max-w-full data-above:-translate-y-full"
            >
              {suggestions.length > 0 ? (
                <div
                  id={listId}
                  role="listbox"
                  aria-label={messages.mentionPeople}
                  className={cn(menuPanel, 'max-h-72')}
                >
                  <MenuHighlight />
                  {suggestions.map((person, index) => (
                    // The pointer picks here; the keyboard stays in the
                    // text area (aria-activedescendant).
                    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
                    <div
                      key={person.id}
                      id={optionId(index)}
                      role="option"
                      tabIndex={-1}
                      aria-selected={index === activeIndex}
                      data-slot="mention-input-item"
                      data-highlighted={index === activeIndex ? '' : undefined}
                      onPointerMove={() => {
                        if (index !== activeIndex) {
                          setActive(index)
                        }
                      }}
                      onClick={() => choose(person)}
                      className={cn(menuRow, 'group/option')}
                    >
                      <PersonAvatar
                        name={person.name}
                        src={person.avatarSrc}
                        alt=""
                        size="sm"
                      />
                      <span className="grid min-w-0 flex-1">
                        <span className="truncate font-medium text-fg-muted group-data-highlighted/option:text-fg">
                          <MentionMatch
                            text={person.name}
                            query={trigger?.query.trim() ?? ''}
                          />
                        </span>
                        {person.description ? (
                          <span className="truncate text-xs text-fg-subtle">
                            {person.description}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className={cn(menuPanel, 'px-3 py-2.5 text-sm text-fg-muted')}
                >
                  {messages.mentionNoMatch(trigger?.query ?? '')}
                </p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </MotionScope>
  )
}

export { MentionInput, serializeMentions }
export type { Mention, MentionInputProps, MentionPerson, MentionValue }
