import { useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { AnimatePresence, m } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { blur, duration, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import {
  PHONE_COUNTRIES,
  capDigits,
  formatNational,
  internationalText,
  nationalE164,
  nationalStatus,
  onlyDigits,
  parseInternational,
  phoneCountry,
  phoneLengths,
  splitTrunk,
} from '../internal/phone-countries.ts'
import type { PhoneCountry, PhoneStatus } from '../internal/phone-countries.ts'
import { PhoneCountryPicker } from '../internal/phone-country-picker.tsx'
import type { PhoneCountryPickerLabels } from '../internal/phone-country-picker.tsx'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'
import { FieldShell } from './field-shell.tsx'

/** What comes with each change, beside the written number. */
type PhoneValueDetails = {
  /** The number in E.164, « +33612345678 », or « » without digits. */
  e164: string
  /** The country's ISO code, « FR ». */
  country: string
  /** How complete the number is, on its length only. */
  status: PhoneStatus
}

/** The words PhoneField writes, to change on one PhoneField only. */
type PhoneFieldLabels = Partial<
  Pick<GoGoUIMessages, 'phoneDigits' | 'phoneCountrySet' | 'phoneValid'>
> &
  PhoneCountryPickerLabels

type PhoneFieldProps = Omit<FieldValueProps<string>, 'onValueChange'> & {
  label: string
  /**
   * The number as written with its code, « +33 6 12 34 56 78 »; a number
   * without a code (« 06 12 34 56 78 ») is read in the current country.
   * `details.e164` gives « +33612345678 ». Called on every change,
   * controlled or not.
   */
  onValueChange?: (value: string, details: PhoneValueDetails) => void
  required?: boolean
  /** Its height: sm 32 px, default 36 px, lg 44 px; 44 px on a phone. */
  size?: 'sm' | 'default' | 'lg'
  /** The chosen country's ISO code, to control it. */
  country?: string
  /** The country until one is chosen or a number with its code comes in; France by default. */
  defaultCountry?: string
  onCountryChange?: (iso: string) => void
  /** Only these countries (ISO codes) in the list. */
  countries?: string[]
  /** At the top of the list, under « Suggestions »; France by default. */
  preferredCountries?: string[]
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: PhoneFieldLabels
}

type Phone = { iso: string; digits: string }

function readPhone(
  text: string,
  current: PhoneCountry,
  pool: PhoneCountry[],
): Phone {
  const parsed = parseInternational(text, pool)
  if (parsed) {
    // +1 is the United States and Canada: the country chosen wins.
    const entry =
      parsed.country.dial === current.dial ? current : parsed.country
    return { iso: entry.iso, digits: capDigits(entry, parsed.national) }
  }
  return { iso: current.iso, digits: capDigits(current, onlyDigits(text)) }
}

/**
 * How complete a written number is, on its length only: `empty`,
 * `incomplete`, `valid` or `too-long`. For a form's schema.
 */
function phoneStatus(text: string, defaultCountry = 'FR'): PhoneStatus {
  const fallback = phoneCountry(defaultCountry) ?? PHONE_COUNTRIES[0]
  if (!fallback) {
    return 'empty'
  }
  const phone = readPhone(text, fallback, PHONE_COUNTRIES)
  return nationalStatus(phoneCountry(phone.iso) ?? fallback, phone.digits)
}

/** A written number in E.164, « +33612345678 », or « » when it has no digits. */
function toE164(text: string, defaultCountry = 'FR'): string {
  const fallback = phoneCountry(defaultCountry) ?? PHONE_COUNTRIES[0]
  if (!fallback) {
    return ''
  }
  const phone = readPhone(text, fallback, PHONE_COUNTRIES)
  return nationalE164(phoneCountry(phone.iso) ?? fallback, phone.digits)
}

/** Where the caret goes in a written number: after its nth digit. */
function caretAfterDigits(text: string, count: number) {
  if (count <= 0) {
    const first = text.search(/\d/)
    return first < 0 ? text.length : first
  }
  let seen = 0
  for (let index = 0; index < text.length; index++) {
    if (/\d/.test(text[index] ?? '') && ++seen === count) {
      return index + 1
    }
  }
  return text.length
}

/**
 * A labelled phone number with its country: the number takes its
 * country's shape as it is typed, a pale guide shows the rest, and the
 * country button grows into a searchable list. After Arc UI's phone input
 * (https://uiarc.dev, MIT), on a table of 50 countries written by hand.
 *
 * **Use it for** a client's or a venue's phone in a form.
 * **Not for** a number to show (write it as text).
 *
 * **Where**: in a form, one per line.
 *
 * **States**: empty (the example as a guide), typing, complete (a tick),
 * too short after leaving it (a hint with the length), list open, no
 * country found, invalid (`error`).
 *
 * **Key props**: `label`, `value` (« +33 6 12 34 56 78 ») + `onValueChange`
 * (controlled; its second argument gives `e164`, `country`, `status`) or
 * `defaultValue` (uncontrolled), `error`,
 * `description`, `defaultCountry` (FR), `country` + `onCountryChange`,
 * `countries`, `preferredCountries` (FR), `size`, `required`. Exported
 * helpers: `phoneStatus()` and `toE164()` for a form's schema,
 * `labels` to change its words.
 *
 * **Accessibility**: a `tel` field (`autoComplete="tel"`) wired to its
 * label, help and error; the country button opens a combobox whose search
 * takes the focus at once (also on a phone, its keyboard up): the arrows
 * move through the countries, Enter or a tap picks one and goes back to
 * the number, Escape closes it and gives the focus back to the button. Its
 * close and clear buttons are 44 px on a phone. A pasted « +44 … » picks
 * its country and says so; « + » typed in the number opens the list. Only
 * the length is checked, not real prefixes.
 *
 * @summary A labelled phone number with its country.
 */
function PhoneField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  required,
  size = 'default',
  country: countryProp,
  defaultCountry = 'FR',
  onCountryChange,
  countries,
  preferredCountries = ['FR'],
  labels,
}: PhoneFieldProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  // onValueChange is called in send(), with the number's details.
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
  })
  const pool = countries?.length
    ? PHONE_COUNTRIES.filter((entry) => countries.includes(entry.iso))
    : PHONE_COUNTRIES
  const fallback =
    pool.find((entry) => entry.iso === defaultCountry) ??
    pool[0] ??
    PHONE_COUNTRIES[0]!
  const names = (() => {
    try {
      return new Intl.DisplayNames([messages.intlLocale], { type: 'region' })
    } catch {
      return null
    }
  })()
  const nameOf = (entry: PhoneCountry) => names?.of(entry.iso) ?? entry.iso
  const preferred = preferredCountries
    .map((iso) => pool.find((entry) => entry.iso === iso))
    .filter((entry): entry is PhoneCountry => entry !== undefined)

  const [phone, setPhone] = useState<Phone>(() =>
    readPhone(value, fallback, pool),
  )
  const current =
    pool.find((entry) => entry.iso === (countryProp ?? phone.iso)) ?? fallback
  const digits = phone.digits

  // A value that is not the one this field sent is read back in.
  const [sent, setSent] = useState(value)
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    if (value !== sent) {
      setPhone(readPhone(value, current, pool))
    }
  }

  const formatted = formatNational(current, digits)
  const status = nationalStatus(current, digits)
  const [touched, setTouched] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [shellSize, shellRef] = useElementSize<HTMLDivElement>()

  // The rest of the example number, in the shape the country expects.
  const [trunk, rest] = splitTrunk(current, digits)
  const full =
    rest.length >= current.example.length
      ? ''
      : formatNational(
          current,
          trunk + rest + current.example.slice(rest.length),
        )
  const guide = full.startsWith(formatted) ? full.slice(formatted.length) : ''

  const lengths = phoneLengths(current)
  const hint =
    !error && touched && (status === 'incomplete' || status === 'too-long')
      ? messages.phoneDigits(nameOf(current), lengths)
      : undefined

  function send(entry: PhoneCountry, nextDigits: string) {
    const text = internationalText(entry, nextDigits)
    setSent(text)
    setValue(text)
    onValueChange?.(text, {
      e164: nationalE164(entry, nextDigits),
      country: entry.iso,
      status: nationalStatus(entry, nextDigits),
    })
  }

  /** New digits, maybe a new country: the caret stays after the same digit. */
  function setNumber(
    input: HTMLInputElement | null,
    nextDigits: string,
    caretDigits: number,
    entry = current,
  ) {
    const capped = capDigits(entry, nextDigits)
    const text = formatNational(entry, capped)
    if (input) {
      input.value = text
      const at = caretAfterDigits(text, Math.min(caretDigits, capped.length))
      input.setSelectionRange(at, at)
    }
    if (entry.iso !== current.iso) {
      onCountryChange?.(entry.iso)
      setAnnouncement(messages.phoneCountrySet(nameOf(entry)))
    }
    if (capped === digits && entry.iso === current.iso) {
      return
    }
    setPhone({ iso: entry.iso, digits: capped })
    send(entry, capped)
  }

  function onNumberChange(input: HTMLInputElement) {
    const raw = input.value
    // Autofill and dropped text: an international number picks its country.
    if (
      raw.includes('+') ||
      (/^\s*00/.test(raw) && onlyDigits(raw).length > 6)
    ) {
      const parsed = parseInternational(
        raw.slice(Math.max(0, raw.indexOf('+'))),
        pool,
      )
      if (parsed?.national) {
        setNumber(
          input,
          parsed.national,
          parsed.national.length,
          parsed.country,
        )
        return
      }
    }
    const caret = input.selectionStart ?? raw.length
    setNumber(input, onlyDigits(raw), onlyDigits(raw.slice(0, caret)).length)
  }

  function onNumberKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget
    if (event.key === '+' && !event.metaKey && !event.ctrlKey) {
      // « + » starts a search by calling code.
      event.preventDefault()
      setQuery('+')
      setOpen(true)
      return
    }
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    if (start !== end || event.metaKey || event.ctrlKey || event.altKey) {
      return
    }
    // Deleting a separator deletes the digit beside it.
    if (
      event.key === 'Backspace' &&
      start > 0 &&
      !/\d/.test(input.value[start - 1] ?? '')
    ) {
      event.preventDefault()
      const index = onlyDigits(input.value.slice(0, start)).length
      if (index > 0) {
        setNumber(
          input,
          digits.slice(0, index - 1) + digits.slice(index),
          index - 1,
        )
      }
    } else if (
      event.key === 'Delete' &&
      start < input.value.length &&
      !/\d/.test(input.value[start] ?? '')
    ) {
      event.preventDefault()
      const index = onlyDigits(input.value.slice(0, start)).length
      setNumber(input, digits.slice(0, index) + digits.slice(index + 1), index)
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text')
    if (!text) {
      return
    }
    event.preventDefault()
    const input = event.currentTarget
    const parsed = /^\s*(\+|00)/.test(text)
      ? parseInternational(text, pool)
      : null
    if (parsed) {
      setNumber(input, parsed.national, parsed.national.length, parsed.country)
      return
    }
    let pasted = onlyDigits(text)
    // « 33 6 12 34 56 78 » pasted in France: the code goes when it would not fit.
    if (
      pasted.startsWith(current.dial) &&
      pasted.length > capDigits(current, pasted).length
    ) {
      pasted = pasted.slice(current.dial.length)
    }
    // A whole number replaces what was there; a piece goes in at the caret.
    if (pasted.length >= Math.min(...lengths)) {
      setNumber(input, pasted, pasted.length)
      return
    }
    const from = onlyDigits(
      input.value.slice(0, input.selectionStart ?? 0),
    ).length
    const to = onlyDigits(input.value.slice(0, input.selectionEnd ?? 0)).length
    setNumber(
      input,
      digits.slice(0, from) + pasted + digits.slice(to),
      from + pasted.length,
    )
  }

  function pick(entry: PhoneCountry) {
    if (entry.iso === current.iso) {
      return
    }
    const nextDigits = capDigits(entry, digits)
    setPhone({ iso: entry.iso, digits: nextDigits })
    onCountryChange?.(entry.iso)
    send(entry, nextDigits)
    setAnnouncement(`${nameOf(entry)}, +${entry.dial}`)
  }

  const heights = { sm: 'h-8', default: 'h-9', lg: 'h-11' }[size]

  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={hint ?? description}
      error={error}
    >
      {(control) => (
        <MotionScope>
          <div
            ref={shellRef}
            data-slot="phone-field"
            className={cn(
              'relative flex w-full min-w-0 rounded-lg bg-field p-px text-fg shadow-field ring-1 ring-field-line transition-[box-shadow] ease-standard ring-inset hover:ring-fg-subtle focus-within:ring-line-focus has-aria-invalid:ring-danger max-md:h-11',
              heights,
              size === 'lg' && 'text-base',
            )}
          >
            <PhoneCountryPicker
              labels={labels}
              country={current}
              pool={pool}
              preferred={preferred}
              nameOf={nameOf}
              open={open}
              onOpenChange={setOpen}
              query={query}
              onQueryChange={setQuery}
              onPick={pick}
              onFocusNumber={() => {
                const input = inputRef.current
                input?.focus({ preventScroll: true })
                input?.setSelectionRange(input.value.length, input.value.length)
              }}
              fieldWidth={shellSize?.width ?? 0}
            />
            <div className="relative flex min-w-0 flex-1 items-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pr-9 pl-3 text-sm whitespace-pre text-fg-subtle tabular-nums max-md:text-[16px]"
              >
                <span className="invisible">{formatted}</span>
                {guide}
              </span>
              <input
                ref={inputRef}
                {...control}
                name={name}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required={required}
                value={formatted}
                onChange={(event) => onNumberChange(event.currentTarget)}
                onKeyDown={onNumberKeyDown}
                onPaste={onPaste}
                onBlur={() => {
                  setTouched(digits.length > 0)
                  onBlur?.()
                }}
                className="relative z-1 h-full w-full min-w-0 rounded-r-[7px] bg-transparent pr-9 pl-3 text-sm text-fg tabular-nums outline-none max-md:text-[16px]"
              />
              <AnimatePresence initial={false}>
                {status === 'valid' && (
                  <m.span
                    key="valid"
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 z-1 -mt-2 grid size-4 place-items-center text-success-fg [&_svg]:size-4"
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            scale: 0.6,
                            filter: `blur(${blur.subtle}px)`,
                          }
                    }
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{
                      opacity: 0,
                      scale: reduce ? 1 : 0.8,
                      transition: { duration: duration.instant },
                    }}
                    transition={
                      reduce ? { duration: duration.instant } : spring.snappy
                    }
                  >
                    <GoGoIcon name="check" weight="bold" />
                  </m.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {announcement ||
              (status === 'valid' ? messages.phoneValid(nameOf(current)) : '')}
          </span>
        </MotionScope>
      )}
    </FieldShell>
  )
}

export { PhoneField, phoneStatus, toE164 }
export type {
  PhoneFieldProps,
  PhoneStatus,
  PhoneValueDetails,
  PhoneFieldLabels,
}
