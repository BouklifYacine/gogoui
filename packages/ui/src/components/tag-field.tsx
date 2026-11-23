import { useState } from 'react'

import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldShell } from './field-shell.tsx'
import { TagInput } from './tag-input.tsx'
import type { TagInputProps } from './tag-input.tsx'

type TagFieldProps = FieldValueProps<string[]> &
  Omit<
    TagInputProps,
    | 'id'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'onBlur'
    | 'aria-invalid'
    | 'aria-describedby'
  > & {
    label: string
  }

/**
 * A labelled list of free tags, with its help and its error.
 *
 * **Use it for** keywords, e-mail addresses to notify, short labels the
 * person makes up. **Not for** a choice among known options
 * (`Combobox` with chips, `CheckboxField`s).
 *
 * **Where**: in a form, full width.
 *
 * **States**: empty, with tags, a tag picked, refused (the reason
 * `validate` gave, or « 5 au plus » past `max`, shows as the error until
 * the text changes), invalid (`error`), disabled. The help and the error
 * slide in (FieldShell).
 *
 * **Key props**: `label`, `value` + `onValueChange` (an array of words),
 * `error`, `description`, `max`, `validate`, `placeholder`, `size`.
 * With TanStack Form, give it the array field.
 *
 * **Accessibility**: label, help and error are wired with
 * `aria-describedby`; adding, removing and picking are read politely (see
 * TagInput).
 *
 * @summary A labelled list of free tags with its error.
 */
function TagField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  onRefusalChange,
  ...inputProps
}: TagFieldProps) {
  const [refusal, setRefusal] = useState<string>()

  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error ?? refusal}
    >
      {(control) => (
        <TagInput
          {...inputProps}
          {...control}
          name={name}
          value={value}
          onValueChange={onValueChange}
          onBlur={onBlur}
          onRefusalChange={(reason) => {
            setRefusal(reason)
            onRefusalChange?.(reason)
          }}
        />
      )}
    </FieldShell>
  )
}

export { TagField }
export type { TagFieldProps }
