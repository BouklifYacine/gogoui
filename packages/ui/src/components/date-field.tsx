import { useState } from 'react'
import { CalendarDotsIcon } from '@phosphor-icons/react'
import { dateMatchModifiers } from 'react-day-picker'
import type { Locale as CalendarLocale, Matcher } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import {
  formatLongDay,
  formatTypedDay,
  parseDay,
  parseTypedDay,
  toDay,
} from '../internal/days.ts'
import { describedBy, useFieldIds } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { cn } from '../lib/cn.ts'
import { buttonVariants } from './button.tsx'
import { Calendar } from './calendar.tsx'
import { Field, FieldDescription, FieldError, FieldLabel } from './field.tsx'
import { Input } from './input.tsx'
import { Popover, PopoverContent, PopoverTrigger } from './popover.tsx'

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
  className?: string
}

/**
 * A calendar day ("YYYY-MM-DD", or null): typed in the field
 * (« 14/06/2027 », any separator), or picked in the calendar its button
 * opens, on the month of the day already chosen. The weekday shows under
 * it in full (« samedi 14 juin 2027 »). A day typed wrong, or one that
 * cannot be chosen, keeps what was typed and says why.
 *
 * @summary A labelled day, typed or picked in a calendar.
 */
function DateField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  disabledDates,
  calendarLocale,
  size,
  className,
}: DateFieldProps) {
  const messages = useGoGoUIMessages()
  const ids = useFieldIds(id, name)
  const dayId = `${ids.id}-day`
  const [open, setOpen] = useState(false)
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
      onValueChange(null)
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
    onValueChange(day)
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
        <Popover open={open} onOpenChange={setOpen}>
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
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              required={required}
              selected={selectedDate}
              // Opens on the month of the day already chosen.
              defaultMonth={selectedDate}
              onSelect={(date: Date | undefined) => {
                clearDraft()
                onValueChange(date ? toDay(date) : null)
                setOpen(false)
              }}
              disabled={disabledDates}
              locale={
                calendarLocale ??
                (messages.intlLocale.startsWith('fr') ? fr : undefined)
              }
              // Days of 44 px, a thumb's target.
              className="[--cell-size:--spacing(11)]"
            />
          </PopoverContent>
        </Popover>
      </div>
      {selectedDate && value && draft === null && (
        <p id={dayId} className="text-sm text-fg-muted first-letter:uppercase">
          {formatLongDay(value, messages.intlLocale)}
        </p>
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
