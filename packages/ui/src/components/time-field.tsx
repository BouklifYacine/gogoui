import { useState } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import {
  QUARTER_HOURS,
  maskTime,
  timeMatches,
  typedTime,
} from '../internal/times.ts'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox.tsx'
import { FieldShell } from './field-shell.tsx'

// The key pressed erased (Backspace, Delete): the colon may then go.
function erases(event: Event | undefined): boolean {
  const native =
    event && 'nativeEvent' in event ? (event.nativeEvent as Event) : event
  return native instanceof InputEvent && native.inputType.startsWith('delete')
}

type TimeFieldProps = FieldValueProps<string> & {
  label: string
}

/**
 * An hour of the day ("14:30"), offered by quarters of an hour and
 * narrowed as one types (« 22 » becomes « 22: » and keeps 22:00 to
 * 22:45). A time picked counts at once; one typed by hand (« 22:10 »)
 * counts on Enter or on leaving the field, never key by key. Something
 * typed that is no time gives the field its time back. Looks like the
 * other fields in every browser, unlike `<input type="time">`.
 *
 * @summary A labelled time, picked by quarters or typed.
 */
function TimeField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
}: TimeFieldProps) {
  const messages = useGoGoUIMessages()
  // The field's text apart from its time while one types.
  const [text, setText] = useState(value)
  const [typing, setTyping] = useState(false)
  // The time changed from elsewhere (a reset): its text.
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  function takeTyped() {
    const time = typing ? typedTime(text) : null
    setTyping(false)
    if (time) onValueChange(time)
    setText(time ?? value)
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
        <Combobox
          items={QUARTER_HOURS}
          filter={timeMatches}
          value={value || null}
          onValueChange={(time: string | null) => {
            setTyping(false)
            if (time) onValueChange(time)
          }}
          inputValue={text}
          onInputValueChange={(next, details) => {
            const typed = details.reason === 'input-change'
            setText(typed ? maskTime(next, erases(details.event)) : next)
            setTyping(typed)
          }}
          openOnInputClick
          autoHighlight
        >
          <ComboboxInput
            {...control}
            name={name}
            onBlur={() => {
              takeTyped()
              onBlur?.()
            }}
            onKeyDown={(event) => {
              // A time typed that the list does not hold (« 22:10 »).
              if (event.key === 'Enter' && typing) {
                const time = typedTime(text)
                if (time && !QUARTER_HOURS.includes(time)) {
                  event.preventDefault()
                  takeTyped()
                }
              }
            }}
            placeholder={messages.timePlaceholder}
            autoComplete="off"
            inputMode="numeric"
            maxLength={5}
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>{messages.timeKeepTyped}</ComboboxEmpty>
            <ComboboxList>
              {(time: string) => (
                <ComboboxItem key={time} value={time} className="min-h-9">
                  {time}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </FieldShell>
  )
}

export { TimeField }
export type { TimeFieldProps }
