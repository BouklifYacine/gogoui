import { useCallback, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent, MouseEvent } from 'react'
import { AnimatePresence, animate, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { subtle } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { cn } from '../lib/cn.ts'

type TagInputProps = {
  /** The tags, when the page keeps them. */
  value?: string[]
  /** The first tags, when the field keeps them itself. */
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Called when the field loses the focus (after adding what was typed). */
  onBlur?: () => void
  placeholder?: string
  /** Its height: sm 32 px, default 36 px, lg 44 px; 44 px on a phone. */
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  /** The most tags it takes. */
  max?: number
  /** Refuses a tag with a reason in words (an e-mail that is not one). */
  validate?: (tag: string) => string | undefined
  /** Told the reason a tag was refused, then undefined once the text changes. */
  onRefusalChange?: (reason: string | undefined) => void
  /** The picked tag's ring; primary by default. */
  color?: Color
  id?: string
  /** Sends each tag with the form, under this name. */
  name?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  'aria-label'?: string
  className?: string
}

const sizes = {
  sm: {
    content: 'min-h-8 p-1 max-md:min-h-11 max-md:p-2',
    item: 'h-6 max-md:h-7',
  },
  default: { content: 'min-h-9 p-1 max-md:min-h-11 max-md:p-2', item: 'h-7' },
  lg: { content: 'min-h-11 p-2', item: 'h-7' },
} as const

/**
 * Free words typed into one field, each becoming a tag, after Arc UI
 * (https://uiarc.dev, MIT).
 *
 * **Prefer** `TagField` in a form (label, help, error). **Not for**
 * choosing from a known list (`Combobox` with chips).
 *
 * **Use it for** keywords, e-mail addresses, short labels the person
 * makes up.
 *
 * **States**: empty (placeholder), with tags, a tag picked (a ring glides
 * to it), refused (red edge), disabled. A new tag blurs in where it was
 * typed while the caret glides aside; a removed tag leaves and the others
 * glide in; the field's height follows its rows on a spring; a duplicate
 * makes the existing tag pulse; the placeholder rises back when the last
 * tag goes.
 *
 * **Key props**: `value` + `onValueChange` (or `defaultValue`), `max`,
 * `validate` (a reason in words refuses the tag), `size`, `color` (the
 * ring), `name` (one form value per tag).
 *
 * **Accessibility**: Enter or a comma adds, leaving the field adds too;
 * Backspace at the start picks the last tag, ← → move between tags, a
 * second Backspace removes it, Escape lets go. Each × is named « Retirer
 * … »; every change is read politely. With reduced motion tags fade.
 *
 * @summary Free words typed into one field, each becoming a tag.
 */
function TagInput({
  value,
  defaultValue = [],
  onValueChange,
  onBlur,
  placeholder,
  size = 'default',
  disabled,
  max,
  validate,
  onRefusalChange,
  color = 'primary',
  id,
  name,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  className,
}: TagInputProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const [internal, setInternal] = useState(defaultValue)
  const [draft, setDraft] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<string>()
  const [notice, setNotice] = useState('')
  const [height, setHeight] = useState<number | 'auto'>('auto')
  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const ringShown = useRef(false)

  const tags = value ?? internal
  const active = picked !== null && tags.includes(picked) ? picked : null
  const invalid =
    ariaInvalid === true || ariaInvalid === 'true' || refusal !== undefined
  const sized = sizes[size]

  // The shell follows its wrapped rows on a spring instead of jumping
  // when a tag starts or leaves a line.
  const measure = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const tagNode = (tag: string) =>
    contentRef.current?.querySelector<HTMLElement>(
      `[data-tag="${CSS.escape(tag)}"]`,
    ) ?? null

  function say(message: string) {
    // The same words twice are still read: a hidden space tells them apart.
    setNotice((previous) => (previous === message ? `${message} ` : message))
  }

  function update(next: string[]) {
    if (value === undefined) {
      setInternal(next)
    }
    onValueChange?.(next)
  }

  function refuse(reason: string | undefined) {
    setRefusal(reason)
    onRefusalChange?.(reason)
    if (reason) {
      say(reason)
    }
  }

  // The ring measures the picked tag's resting box and glides between
  // picks; it fades in place when the pick clears.
  function placeRing(tag: string | null) {
    const ring = ringRef.current
    if (!ring) {
      return
    }
    const node = tag === null ? null : tagNode(tag)
    if (!node) {
      if (ringShown.current) {
        animate(ring, reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }, {
          duration: reduce ? 0 : duration.instant,
          ease: ease.standard,
        })
      }
      ringShown.current = false
      return
    }
    const box = {
      x: node.offsetLeft,
      y: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight,
    }
    if (ringShown.current && !reduce) {
      animate(
        ring,
        { ...box, opacity: 1, scale: 1 },
        { ...spring.morph, opacity: { duration: duration.fast } },
      )
    } else {
      animate(
        ring,
        { ...box, opacity: [0, 1], scale: [reduce ? 1 : 0.9, 1] },
        reduce
          ? { duration: 0 }
          : {
              duration: 0,
              opacity: { duration: duration.fast },
              scale: spring.snappy,
            },
      )
    }
    ringShown.current = true
  }

  function pick(tag: string | null) {
    setPicked(tag)
    placeRing(tag)
    if (tag !== null) {
      say(messages.tagSelected(tag))
    }
  }

  /** Adds what it can; true when every word went in. */
  function addAll(words: string[]): boolean {
    let next = tags
    let added: string | undefined
    let reason: string | undefined
    let complete = true
    for (const word of words) {
      const tag = word.trim()
      if (!tag) {
        continue
      }
      const existing = next.find(
        (item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase(),
      )
      if (existing) {
        // The ignored word still gets an answer: the tag already there
        // pulses.
        const node = tagNode(existing)
        if (node && !reduce) {
          animate(
            node,
            { scale: [1, 1.06, 1] },
            {
              duration: duration.standard + duration.instant,
              ease: ease.inOut,
            },
          )
        }
        say(messages.tagDuplicate(existing))
        complete = false
        continue
      }
      if (max !== undefined && next.length >= max) {
        reason = messages.tagLimit(max)
        complete = false
        break
      }
      const refused = validate?.(tag)
      if (refused) {
        reason = refused
        complete = false
        continue
      }
      next = [...next, tag]
      added = tag
    }
    if (next !== tags) {
      update(next)
      pick(null)
    }
    if (reason) {
      refuse(reason)
    } else if (added) {
      refuse(undefined)
      say(messages.tagAdded(added))
    }
    return complete
  }

  function addDraft() {
    if (draft.trim() && addAll([draft])) {
      setDraft('')
    }
  }

  function remove(tag: string) {
    update(tags.filter((item) => item !== tag))
    pick(null)
    say(messages.tagRemoved(tag))
    inputRef.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { key, currentTarget: input } = event
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0
    const index = active === null ? tags.length : tags.indexOf(active)
    let handled = true
    if ((key === 'Enter' && draft.trim()) || key === ',') {
      addDraft()
    } else if ((key === 'Backspace' || key === 'Delete') && active !== null) {
      remove(active)
    } else if (key === 'Backspace' && atStart && tags.length > 0) {
      pick(tags.at(-1) ?? null)
    } else if (
      key === 'ArrowLeft' &&
      (atStart || active !== null) &&
      index > 0
    ) {
      pick(tags[index - 1] ?? null)
    } else if (key === 'ArrowRight' && active !== null) {
      pick(tags[index + 1] ?? null)
    } else if (key === 'Escape' && active !== null) {
      pick(null)
    } else {
      handled = false
    }
    if (handled) {
      event.preventDefault()
    }
  }

  // A pasted list (« a, b, c » or one per line) becomes several tags.
  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text')
    if (/[,\n]/.test(text)) {
      event.preventDefault()
      addAll(text.split(/[,\n]/))
    }
  }

  // A click on a tag picks it without taking the focus from the field.
  function onTagClick(event: MouseEvent<HTMLElement>, tag: string) {
    if ((event.target as HTMLElement).closest('button') || disabled) {
      return
    }
    pick(active === tag ? null : tag)
    inputRef.current?.focus()
  }

  const glide = reduce ? { duration: 0 } : spring.smooth
  const move = reduce ? { duration: 0 } : spring.morph

  return (
    <MotionScope>
      <motion.div
        data-slot="tag-input"
        data-size={size}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        initial={false}
        animate={{ height }}
        transition={glide}
        className={cn(
          'w-full min-w-0 overflow-hidden rounded-lg bg-field text-fg shadow-field ring-1 ring-field-line ring-inset transition-[box-shadow] duration-150 ease-standard focus-within:ring-line-focus hover:ring-fg-subtle forced-colors:border data-disabled:cursor-not-allowed data-disabled:bg-subtle data-disabled:shadow-none data-invalid:ring-danger motion-reduce:transition-none',
          className,
        )}
      >
        {/* A click beside the tags focuses the field, for the mouse only:
            the keyboard reaches the field itself. */}
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          ref={measure}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              inputRef.current?.focus()
            }
          }}
          className={cn(
            'relative flex cursor-text flex-wrap content-start items-center gap-1.5',
            sized.content,
          )}
        >
          <span
            ref={ringRef}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-0 left-0 z-1 rounded-full opacity-0',
              subtle[color],
              'ring-1 ring-inset',
            )}
          />
          {/* `contents`: the tags wrap with the field's text box. */}
          <ul className="contents">
            <AnimatePresence initial={false} mode="popLayout">
              {tags.map((tag) => (
                // The keyboard picks a tag with the arrows; the click is a
                // shortcut for the mouse.
                // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                <motion.li
                  key={tag}
                  layout={reduce ? false : 'position'}
                  data-tag={tag}
                  data-picked={tag === active || undefined}
                  data-disabled={disabled || undefined}
                  onMouseDown={(event) => {
                    if (!(event.target as HTMLElement).closest('button')) {
                      event.preventDefault()
                    }
                  }}
                  onClick={(event) => onTagClick(event, tag)}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          scale: 0.9,
                          filter: `blur(${blur.soft}px)`,
                        }
                  }
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    transitionEnd: { filter: 'none' },
                  }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0 } }
                      : {
                          opacity: 0,
                          scale: 0.9,
                          filter: `blur(${blur.subtle}px)`,
                          transition: {
                            duration: duration.instant,
                            ease: ease.standard,
                          },
                        }
                  }
                  transition={
                    reduce
                      ? { duration: duration.instant }
                      : {
                          ...spring.morph,
                          layout: move,
                          opacity: {
                            duration: duration.fast,
                            ease: ease.enter,
                          },
                          filter: {
                            duration: duration.standard,
                            ease: ease.enter,
                          },
                        }
                  }
                  className={cn(
                    'relative inline-flex cursor-default items-center gap-0.5 rounded-full bg-control ps-2.5 pe-1 text-sm whitespace-nowrap text-fg shadow-button data-disabled:opacity-60',
                    sized.item,
                  )}
                >
                  {/* Above the ring, while the tag's fill stays below it. */}
                  <span className="relative z-2">{tag}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={messages.removeTag(tag)}
                    onClick={() => remove(tag)}
                    className="relative z-2 grid size-5.5 place-items-center rounded-full text-fg-muted outline-none transition-[color,background-color,scale] duration-150 ease-standard hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-[0.96] active:duration-100 disabled:pointer-events-none motion-reduce:transition-none motion-reduce:active:scale-100"
                  >
                    <GoGoIcon
                      name="close"
                      aria-hidden="true"
                      className="size-3.5"
                    />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <motion.span
            layout={reduce ? false : 'position'}
            transition={{ layout: move }}
            className="relative flex min-w-20 flex-1 basis-24"
          >
            {/* The visible placeholder, so it can rise back when the last
                tag leaves; the field's own stays for screen readers. */}
            <AnimatePresence initial={false}>
              {!draft && tags.length === 0 && placeholder ? (
                <motion.span
                  key="placeholder"
                  aria-hidden="true"
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: '0.3em',
                          filter: `blur(${blur.soft}px)`,
                        }
                  }
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={
                    reduce
                      ? { duration: duration.instant }
                      : { duration: duration.standard, ease: ease.enter }
                  }
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-1.5 text-sm whitespace-nowrap text-fg-subtle max-md:text-[16px]"
                >
                  {placeholder}
                </motion.span>
              ) : null}
            </AnimatePresence>
            <input
              ref={inputRef}
              id={id}
              value={draft}
              disabled={disabled}
              placeholder={tags.length === 0 ? placeholder : undefined}
              aria-label={ariaLabel}
              aria-invalid={invalid || undefined}
              aria-describedby={ariaDescribedBy}
              onChange={(event) => {
                setDraft(event.currentTarget.value)
                if (active !== null) {
                  pick(null)
                }
                if (refusal !== undefined) {
                  refuse(undefined)
                }
              }}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              onBlur={() => {
                addDraft()
                if (active !== null) {
                  pick(null)
                }
                onBlur?.()
              }}
              className={cn(
                'w-full min-w-0 bg-transparent px-1.5 text-sm text-fg outline-none placeholder:text-transparent disabled:cursor-not-allowed max-md:text-[16px]',
                sized.item,
              )}
            />
          </motion.span>
        </div>
        {name
          ? tags.map((tag) => (
              <input key={tag} type="hidden" name={name} value={tag} />
            ))
          : null}
        <span aria-live="polite" className="sr-only">
          {notice}
        </span>
      </motion.div>
    </MotionScope>
  )
}

export { TagInput }
export type { TagInputProps }
