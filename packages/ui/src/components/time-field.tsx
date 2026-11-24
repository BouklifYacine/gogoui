import { useState } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
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

/** The words TimeField writes, to change on one TimeField only. */
type TimeFieldLabels = Partial<
  Pick<GoGoUIMessages, 'timePlaceholder' | 'timeKeepTyped'>
>

type TimeFieldProps = FieldValueProps<string> & {
  label: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: TimeFieldLabels
}

/**
 * A labelled time, picked by quarters or typed.
 *
 * **Use it for** an arrival, a start, an appointment.
 *
 * **Key props**: `label`, `value` (« 14:30 ») + `onValueChange` (controlled)
 * or `defaultValue` (uncontrolled), `error`, `description`,
 * `labels` to change its words.
 *
 * **Accessibility**: typing « 1430 » or « 14h30 » works.
 *
 * @summary A labelled time, picked by quarters or typed.
 */
function TimeField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  labels,
}: TimeFieldProps) {
  const messages = useGoGoUIMessages(labels)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
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
    if (time) setValue(time)
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
            if (time) setValue(time)
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
export type { TimeFieldProps, TimeFieldLabels }
