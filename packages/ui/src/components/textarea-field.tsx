import type { ComponentProps } from 'react'

import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldShell } from './field-shell.tsx'
import { Textarea } from './textarea.tsx'

type TextareaFieldProps = FieldValueProps<string> &
  Omit<
    ComponentProps<typeof Textarea>,
    'id' | 'name' | 'value' | 'onChange' | 'onBlur'
  > & {
    label: string
  }

/**
 * A text of several lines (a message, notes) with its label, help and
 * error. Four lines by default.
 *
 * @summary A labelled text of several lines.
 */
function TextareaField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  ...textareaProps
}: TextareaFieldProps) {
  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <Textarea
          rows={4}
          {...textareaProps}
          {...control}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onValueChange(event.target.value)}
        />
      )}
    </FieldShell>
  )
}

export { TextareaField }
export type { TextareaFieldProps }
