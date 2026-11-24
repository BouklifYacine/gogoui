import { useId, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { CurrencyEurIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { AnimatePresence, animate, m, useMotionValue } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { describedBy } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import {
  caretAfter,
  moneyCents,
  moneyDraft,
  moneyParts,
  moneySymbols,
  moneyText,
  pastedMoney,
  readMoney,
} from '../internal/money-draft.ts'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'
import { FieldShell } from './field-shell.tsx'

/** The words MoneyField writes, to change on one MoneyField only. */
type MoneyFieldLabels = Partial<
  Pick<
    GoGoUIMessages,
    'moneyUpTo' | 'moneyAtLeast' | 'moneyBetween' | 'moneyQuickAdd' | 'moneyAdd'
  >
>

type MoneyFieldProps = FieldValueProps<string> & {
  label: string
  placeholder?: string
  required?: boolean
  /** The currency's icon, the euro by default. */
  icon?: Icon
  /** The field's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
  /** The currency's code, for the words around the amount (« Jusqu'à 5 000 € »). */
  currency?: string
  /** Chips under the field that add these amounts, in euros: `[10, 50, 100]`. */
  quickAdd?: number[]
  /** The lowest amount, said under the field. */
  min?: number
  /** The highest amount, said under the field; typing past it is refused. */
  max?: number
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: MoneyFieldLabels
}

// A refused change kicks the amount sideways and springs it home: a
// spring a little slower than the interface's, so the strain reads.
const physical = (visualDuration: number) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: 'spring' as const, stiffness: root * root, damping: 2 * root }
}
const KICK = physical(0.42)

/**
 * A labelled amount, typed the way people write it: the digits group as
 * they come, the missing cents wait in pale ghosts, and the digits roll
 * when a chip adds to it. After Arc UI's money input (https://uiarc.dev,
 * MIT).
 *
 * **Use it for** a price, a deposit, a budget. Accepts « 1 200,50 »,
 * « 1200.5 » and a pasted « 1.234,56 € ».
 * **Not for** a count (`NumberField`).
 *
 * **Where**: in a form, one per line.
 *
 * **States**: empty, typing (grouped as typed, the caret kept), filled
 * (ghost cents), too long (the amount shrinks to fit), refused past `max`
 * (a sideways kick, the range flashes), disabled, invalid.
 *
 * **Key props**: `label`, `value` (the shown text, « 1 200,5 »: your
 * form's schema turns it into a number) + `onValueChange` (controlled) or
 * `defaultValue` (uncontrolled), `error`, `description`, `placeholder`,
 * `required`, `size`, `icon`, `currency`, `quickAdd`, `min`, `max`,
 * `labels` to change its words.
 *
 * **Accessibility**: a decimal keyboard on a phone; a plain text box whose
 * range is read with it (`aria-describedby`); a chip says the new amount
 * aloud. With reduced motion the digits change at once.
 *
 * @summary A labelled amount, typed as people write it.
 */
function MoneyField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  // None by default: a grey amount in an empty field reads as one already
  // typed. An example goes in the description instead.
  placeholder,
  required,
  icon: CurrencyIcon = CurrencyEurIcon,
  size = 'default',
  currency = 'EUR',
  quickAdd = [],
  min,
  max,
  labels,
}: MoneyFieldProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const symbols = moneySymbols(messages.intlLocale)
  const rangeId = `${useId()}-range`
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  const draft = readMoney(value, value.length, symbols)?.draft ?? ''
  const cents = moneyCents(draft)
  const shownText = moneyText(draft, symbols)
  const parts = moneyParts(draft, symbols)

  // What the field sent last: any other value came from outside and rolls.
  const [sent, setSent] = useState<{ text: string; typed: boolean } | null>(
    null,
  )
  const instant = sent !== null && sent.typed && value === sent.text
  const [trail, setTrail] = useState({ cents, direction: 1 })
  if (trail.cents !== cents) {
    setTrail({ cents, direction: (cents ?? 0) >= (trail.cents ?? 0) ? 1 : -1 })
  }
  const direction = trail.direction

  const [flash, setFlash] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const flashTimer = useRef(0)
  const bumpX = useMotionValue(0)
  const [wrapSize, wrapRef] = useElementSize<HTMLDivElement>()
  const [groupSize, groupRef] = useElementSize<HTMLDivElement>()
  const scale =
    wrapSize && groupSize && groupSize.width > 0
      ? Math.min(1, wrapSize.width / groupSize.width)
      : 1

  const words = (amount: number) =>
    new Intl.NumberFormat(messages.intlLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount)

  function refuse(toward: 1 | -1, limit: number) {
    if (!reduce) {
      animate(bumpX, 0, { ...KICK, velocity: toward * 160 })
    }
    setFlash(true)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(false), 1400)
    setAnnouncement(
      toward > 0
        ? messages.moneyUpTo(words(limit))
        : messages.moneyAtLeast(words(limit)),
    )
  }

  function send(nextDraft: string, from: 'type' | 'other') {
    const text = moneyText(nextDraft, symbols)
    setSent({ text, typed: from === 'type' })
    setValue(text)
    return text
  }

  /** Reads the field's text, keeps the caret where it was, refuses past `max`. */
  function apply(input: HTMLInputElement, raw: string, caret: number) {
    const read = readMoney(raw, caret, symbols)
    const nextCents = read ? moneyCents(read.draft) : null
    if (
      !read ||
      (max !== undefined && nextCents !== null && nextCents > max * 100)
    ) {
      if (read && max !== undefined) {
        refuse(1, max)
      }
      // The caret stays where it was: one mark before where the browser left it.
      const typed = Array.from(raw.slice(0, caret)).filter(
        (char) => /\d/.test(char) || char === symbols.decimal || char === '.',
      ).length
      const back = caretAfter(shownText, Math.max(0, typed - 1), symbols)
      input.value = shownText
      input.setSelectionRange(back, back)
      return
    }
    const text = send(read.draft, 'type')
    // The new text goes in now, so the caret can be put back before React
    // renders the same text.
    input.value = text
    const at = caretAfter(text, read.before, symbols)
    input.setSelectionRange(at, at)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    if (start !== end || event.metaKey || event.ctrlKey || event.altKey) {
      return
    }
    // Deleting a group space deletes the digit before it instead.
    if (
      event.key === 'Backspace' &&
      start > 1 &&
      input.value[start - 1] === symbols.group
    ) {
      event.preventDefault()
      apply(
        input,
        input.value.slice(0, start - 2) + input.value.slice(start - 1),
        start - 2,
      )
    } else if (event.key === 'Delete' && input.value[start] === symbols.group) {
      event.preventDefault()
      apply(
        input,
        input.value.slice(0, start + 1) + input.value.slice(start + 2),
        start + 1,
      )
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = pastedMoney(event.clipboardData.getData('text').trim())
    if (pasted === null) {
      return
    }
    event.preventDefault()
    const input = event.currentTarget
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    const inserted = pasted.replace('.', symbols.decimal)
    const whole = (start === 0 && end === input.value.length) || !input.value
    const raw = whole
      ? inserted
      : input.value.slice(0, start) + inserted + input.value.slice(end)
    apply(input, raw, whole ? raw.length : start + inserted.length)
  }

  /** A chip adds its amount; past `max` it stops there and says so. */
  function add(amount: number) {
    const from = cents ?? 0
    let next = from + Math.round(amount * 100)
    if (max !== undefined && next > max * 100) {
      if (from >= max * 100) {
        refuse(1, max)
        return
      }
      next = max * 100
      refuse(1, max)
    }
    send(moneyDraft(next, draft.includes('.')), 'other')
    setAnnouncement(words(next / 100))
  }

  const range =
    min !== undefined && max !== undefined
      ? messages.moneyBetween(words(min), words(max))
      : max !== undefined
        ? messages.moneyUpTo(words(max))
        : min !== undefined
          ? messages.moneyAtLeast(words(min))
          : ''
  const chips = quickAdd.filter((amount) => amount > 0)
  const atMax = max !== undefined && (cents ?? 0) >= max * 100

  const column = {
    enter: { width: 0, opacity: 0 },
    center: {
      width: 'auto',
      opacity: 1,
      transition: { width: spring.morph, opacity: { duration: duration.fast } },
    },
    exit: {
      width: 0,
      opacity: 0,
      transition: {
        width: spring.smooth,
        opacity: { duration: duration.instant },
      },
    },
  }
  const cut = {
    enter: { width: 'auto', opacity: 1 },
    center: { width: 'auto', opacity: 1, transition: { duration: 0 } },
    exit: { width: 0, opacity: 0, transition: { duration: 0 } },
  }
  const glyph = {
    enter: (dir: number) => ({
      y: `${dir * 0.55}em`,
      opacity: 0,
      filter: `blur(${blur.soft}px)`,
    }),
    center: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transitionEnd: { filter: 'none' },
      transition: {
        y: spring.snappy,
        opacity: { duration: duration.fast, ease: ease.enter },
        filter: { duration: duration.exit, ease: ease.enter },
      },
    },
    exit: (dir: number) => ({
      y: `${dir * -0.55}em`,
      opacity: 0,
      filter: `blur(${blur.subtle}px)`,
      transition: { duration: duration.instant, ease: ease.standard },
    }),
  }
  const glyphCut = {
    enter: { y: 0, opacity: 1, filter: 'none' },
    center: { y: 0, opacity: 1, filter: 'none', transition: { duration: 0 } },
    exit: { opacity: 0, transition: { duration: 0 } },
  }

  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <MotionScope>
          <div
            data-slot="money-field"
            data-size={size}
            className={cn(
              'relative flex h-9 w-full min-w-0 items-center gap-2 rounded-lg bg-field px-3 text-sm text-fg shadow-field ring-1 ring-field-line transition-[box-shadow] ease-standard ring-inset focus-within:ring-line-focus hover:ring-fg-subtle has-aria-invalid:ring-danger max-md:h-11 max-md:text-[16px]',
              size === 'sm' && 'h-8',
              size === 'lg' && 'h-11 text-base',
            )}
          >
            <CurrencyIcon
              aria-hidden="true"
              className="pointer-events-none size-4.5 shrink-0 text-fg-subtle"
            />
            <div
              ref={wrapRef}
              role="presentation"
              className="relative flex h-full min-w-0 flex-1 cursor-text items-center overflow-hidden"
              onMouseDown={(event) => {
                // A press beside the amount puts the caret at its end.
                if (!(event.target instanceof HTMLInputElement)) {
                  event.preventDefault()
                  const input = event.currentTarget.querySelector('input')
                  input?.focus()
                  input?.setSelectionRange(
                    input.value.length,
                    input.value.length,
                  )
                }
              }}
            >
              <m.div
                ref={groupRef}
                className={cn(
                  'origin-left items-center whitespace-nowrap tabular-nums',
                  draft ? 'inline-flex flex-none' : 'flex flex-1',
                )}
                style={{ x: bumpX }}
                initial={false}
                animate={{ scale }}
                transition={reduce ? { duration: 0 } : spring.smooth}
              >
                <span
                  className={cn(
                    'items-center',
                    draft ? 'relative inline-flex' : 'flex flex-1',
                  )}
                >
                  <span aria-hidden="true" className="inline-flex">
                    <AnimatePresence initial={false} custom={direction}>
                      {parts.map((part) => (
                        <m.span
                          key={part.key}
                          custom={direction}
                          variants={instant || reduce ? cut : column}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className={cn(
                            'relative inline-block overflow-y-clip whitespace-pre transition-colors duration-200 ease-standard [--feather:0.18em] my-[calc(var(--feather)*-1)] py-(--feather) [mask-image:linear-gradient(to_bottom,transparent,#000_calc(var(--feather)*1.4),#000_calc(100%-var(--feather)*1.4),transparent)]',
                            part.ghost && 'text-fg-subtle',
                          )}
                        >
                          <span className="invisible">{part.char}</span>
                          <AnimatePresence initial={false} custom={direction}>
                            <m.span
                              key={part.char}
                              custom={direction}
                              variants={instant || reduce ? glyphCut : glyph}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              className="absolute inset-x-0 inset-y-(--feather) text-center whitespace-pre"
                            >
                              {part.char}
                            </m.span>
                          </AnimatePresence>
                        </m.span>
                      ))}
                    </AnimatePresence>
                  </span>
                  <input
                    {...control}
                    aria-describedby={describedBy(
                      control['aria-describedby'],
                      range && rangeId,
                    )}
                    name={name}
                    // type="number" would refuse « 3 000 » and lose the comma.
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={placeholder}
                    required={required}
                    value={shownText}
                    onBlur={onBlur}
                    onChange={(event) => {
                      const input = event.currentTarget
                      apply(
                        input,
                        input.value,
                        input.selectionStart ?? input.value.length,
                      )
                    }}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    className={cn(
                      'h-full min-w-0 bg-transparent p-0 text-transparent caret-fg outline-none selection:bg-fg/15 selection:text-transparent placeholder:text-fg-subtle disabled:cursor-not-allowed',
                      draft
                        ? 'absolute inset-y-0 left-0 w-[calc(100%+0.5em)]'
                        : 'w-full',
                    )}
                  />
                </span>
              </m.div>
            </div>
          </div>
          {(chips.length > 0 || range) && (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              {chips.length > 0 && (
                <div
                  role="group"
                  aria-label={messages.moneyQuickAdd}
                  className="flex flex-wrap gap-1.5"
                >
                  {chips.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      aria-controls={control.id}
                      aria-label={messages.moneyAdd(words(amount))}
                      aria-disabled={atMax || undefined}
                      onClick={() => add(amount)}
                      className="h-7.5 rounded-full bg-control px-3 text-xs font-medium text-fg-muted tabular-nums shadow-control transition-[background-color,color,scale] duration-150 ease-standard hover:bg-control-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-96 aria-disabled:opacity-45 motion-reduce:active:scale-100"
                    >
                      +{words(amount)}
                    </button>
                  ))}
                </div>
              )}
              {range && (
                <span
                  id={rangeId}
                  data-flash={flash ? '' : undefined}
                  className="text-xs text-fg-muted tabular-nums transition-colors duration-200 ease-standard data-flash:text-warning-fg data-flash:duration-100"
                >
                  {range}
                </span>
              )}
            </div>
          )}
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </MotionScope>
      )}
    </FieldShell>
  )
}

export { MoneyField }
export type { MoneyFieldProps, MoneyFieldLabels }
