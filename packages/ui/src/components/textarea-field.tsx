import type { ComponentProps } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { describedBy } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { cn } from '../lib/cn.ts'
import { FieldShell } from './field-shell.tsx'
import { RollingNumber } from './rolling-number.tsx'
import { Textarea } from './textarea.tsx'

/** The words TextareaField writes, to change on one TextareaField only. */
type TextareaFieldLabels = Partial<Pick<GoGoUIMessages, 'charactersLeft'>>

type TextareaFieldProps = FieldValueProps<string> &
  Omit<
    ComponentProps<typeof Textarea>,
    'id' | 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
  > & {
    label: string
    /**
     * The most characters it takes; given, a counter « 120 / 500 » shows
     * under the field and says what is left near the end.
     */
    maxLength?: number
    /** Its words on this one only, over GoGoUIProvider's `messages`. */
    labels?: TextareaFieldLabels
  }

// Under this many characters left, the count is read aloud.
const NEAR_END = 20

/**
 * A labelled text of several lines, with an optional counter.
 *
 * **Use it for** a message, a note, a description.
 *
 * **States**: empty, filled, focus, invalid, near the limit (the counter
 * turns), over it. The count's digits roll as you type; help and error
 * slide in (FieldShell).
 *
 * **Key props**: `label`, `value` + `onValueChange` (controlled) or
 * `defaultValue` (uncontrolled), `error`, `description`, `maxLength`
 * (shows « 120 caractères restants »). Four lines high,
 * `labels` to change its words.
 *
 * **Accessibility**: the counter is read politely, not at every key.
 *
 * @summary A labelled text of several lines, with a counter.
 */
function TextareaField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  maxLength,
  labels,
  ...textareaProps
}: TextareaFieldProps) {
  const { charactersLeft } = useGoGoUIMessages(labels)
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const left = maxLength === undefined ? null : maxLength - value.length

  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <>
          <Textarea
            rows={4}
            {...textareaProps}
            {...control}
            aria-describedby={describedBy(
              control['aria-describedby'],
              left !== null && `${control.id}-count`,
            )}
            name={name}
            maxLength={maxLength}
            value={value}
            onBlur={onBlur}
            onChange={(event) => setValue(event.target.value)}
          />
          {left !== null && (
            <p
              id={`${control.id}-count`}
              className={cn(
                'text-right text-sm text-fg-subtle tabular-nums',
                left <= NEAR_END && 'text-warning-fg',
                left <= 0 && 'text-danger-fg',
              )}
            >
              <span aria-hidden="true">
                <RollingNumber value={value.length} /> / {maxLength}
              </span>
              {/* Read only near the end: every key would be noise. */}
              <span aria-live="polite" className="sr-only">
                {left <= NEAR_END ? charactersLeft(left) : ''}
              </span>
            </p>
          )}
        </>
      )}
    </FieldShell>
  )
}

export { TextareaField }
export type { TextareaFieldProps, TextareaFieldLabels }
