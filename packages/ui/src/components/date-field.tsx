import { useRef, useState } from 'react'
import { CalendarDotsIcon } from '@phosphor-icons/react'
import { dateMatchModifiers } from 'react-day-picker'
import type { Locale as CalendarLocale, Matcher } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import { DatePopup } from '../internal/date-popup.tsx'
import {
  formatTypedDay,
  parseDay,
  parseTypedDay,
  toDay,
} from '../internal/days.ts'
import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { RollingDate } from '../internal/rolling-date.tsx'
import { cn } from '../lib/cn.ts'
import { buttonVariants } from './button.tsx'
import { Calendar } from './calendar.tsx'
import { Field, FieldDescription, FieldError, FieldLabel } from './field.tsx'
import { Input } from './input.tsx'
import { Popover, PopoverTrigger } from './popover.tsx'

// A picked day closes the calendar a beat later, once its disc has glided.
const CLOSE_DELAY = 300

type DateFieldProps = FieldValueProps<string | null> & {
  label: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  /** Days that cannot be chosen (`{ before: new Date() }`). */
  disabledDates?: Matcher | Matcher[]
  /** The calendar's month and day names; follows GoGoUIProvider by default. */
  calendarLocale?: Partial<CalendarLocale>
  /** The field's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
  /** The chosen day's colour in the calendar; the primary by default. */
  color?: Color
  className?: string
}

/**
 * A labelled day, typed or picked in a calendar, with Arc UI's motion
 * (https://uiarc.dev, MIT): the calendar grows out of its button, a picked
 * day closes it a beat later (once the disc has glided), and the day in
 * words under the field rolls only the part that changed.
 *
 * **Use it for** one date in a form: a wedding day, a due date. **Prefer**
 * `DateRangePicker` for a period.
 *
 * **Where**: in a form, one per line.
 *
 * **States**: empty, filled (the day in words under it), calendar open,
 * disabled days, invalid (typed wrong, or a day that cannot be chosen).
 *
 * **Key props**: `label`, `value` ("YYYY-MM-DD" or null) +
 * `onValueChange`, `error`, `placeholder`, `required`, `disabledDates` (a
 * react-day-picker matcher: past days, Mondays), `calendarLocale`, `size`,
 * `color`.
 *
 * **Accessibility**: typed in the local format; the calendar button is
 * named; the calendar opens on the chosen day (arrows work at once) and
 * gives the focus back to its button; the day in words is read whole.
 * With reduced motion, a picked day closes the calendar at once.
 *
 * @summary A labelled day, typed or picked in a calendar.
 */
function DateField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  disabledDates,
  calendarLocale,
  size,
  color,
  className,
}: DateFieldProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const ids = useFieldIds(id, name)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const dayId = `${ids.id}-day`
  const [open, setOpen] = useState(false)
  const closing = useRef<number | undefined>(undefined)

  function openChange(next: boolean) {
    window.clearTimeout(closing.current)
    setOpen(next)
  }
  // What is typed, until the field is left; null shows the value.
  const [draft, setDraft] = useState<string | null>(null)
  const [typedError, setTypedError] = useState<string | null>(null)
  // A value changed from outside drops the draft.
  const [seenValue, setSeenValue] = useState(value)
  if (value !== seenValue) {
    setSeenValue(value)
    setDraft(null)
    setTypedError(null)
  }

  function clearDraft() {
    setDraft(null)
    setTypedError(null)
  }

  function readDraft() {
    if (draft === null) return
    if (draft.trim() === '') {
      clearDraft()
      setValue(null)
      return
    }
    const day = parseTypedDay(draft, messages.dayOrder)
    if (day === null) {
      setTypedError(messages.dateTypedError)
      return
    }
    const date = parseDay(day)
    if (date && disabledDates && dateMatchModifiers(date, disabledDates)) {
      setTypedError(messages.dateUnavailable)
      return
    }
    clearDraft()
    setValue(day)
  }

  const selectedDate = parseDay(value)
  const shownError = typedError ?? error

  return (
    <Field
      className={className}
      data-invalid={shownError ? true : undefined}
      data-disabled={disabled || undefined}
    >
      <FieldLabel htmlFor={ids.id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={ids.id}
          name={name}
          size={size}
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder ?? messages.datePlaceholder}
          disabled={disabled}
          required={required}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy(
            selectedDate && dayId,
            description && ids.descriptionId,
            shownError && ids.errorId,
          )}
          // A form can refuse to submit while a typed day is wrong.
          data-typed-invalid={typedError ? true : undefined}
          value={
            draft ?? (value ? formatTypedDay(value, messages.dayOrder) : '')
          }
          onChange={(event) => setDraft(event.target.value)}
          // A day already there is selected: what is typed replaces it.
          onFocus={(event) => event.currentTarget.select()}
          onBlur={() => {
            readDraft()
            onBlur?.()
          }}
          onKeyDown={(event) => {
            // Enter reads what was typed instead of sending the form.
            if (event.key === 'Enter' && draft !== null) {
              event.preventDefault()
              readDraft()
            }
          }}
        />
        <Popover open={open} onOpenChange={openChange}>
          <PopoverTrigger
            type="button"
            disabled={disabled}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon' }),
              'shrink-0',
            )}
          >
            <CalendarDotsIcon aria-hidden="true" />
            <span className="sr-only">{messages.pickDate(label)}</span>
          </PopoverTrigger>
          <DatePopup align="end">
            <Calendar
              mode="single"
              required={required}
              selected={selectedDate}
              // Opens on the month of the day already chosen.
              defaultMonth={selectedDate}
              onSelect={(date: Date | undefined) => {
                clearDraft()
                setValue(date ? toDay(date) : null)
                window.clearTimeout(closing.current)
                if (reduce || !date) {
                  setOpen(false)
                } else {
                  closing.current = window.setTimeout(
                    () => setOpen(false),
                    CLOSE_DELAY,
                  )
                }
              }}
              disabled={disabledDates}
              color={color}
              locale={
                calendarLocale ??
                (messages.intlLocale.startsWith('fr') ? fr : undefined)
              }
            />
          </DatePopup>
        </Popover>
      </div>
      {selectedDate && draft === null && (
        <RollingDate
          id={dayId}
          date={selectedDate}
          locale={messages.intlLocale}
          className="text-sm text-fg-muted"
        />
      )}
      {description && (
        <FieldDescription id={ids.descriptionId}>
          {description}
        </FieldDescription>
      )}
      {shownError && <FieldError id={ids.errorId}>{shownError}</FieldError>}
    </Field>
  )
}

export { DateField }
export type { DateFieldProps }
