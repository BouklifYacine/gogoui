import type { ChangeEvent, ComponentProps } from 'react'
import type { Icon } from '@phosphor-icons/react'

import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldShell } from './field-shell.tsx'
import { Input } from './input.tsx'
import { InputWithIcon } from './input-with-icon.tsx'

type TextFieldProps = FieldValueProps<string> &
  Omit<
    ComponentProps<typeof Input>,
    'id' | 'name' | 'value' | 'onChange' | 'onBlur'
  > & {
    label: string
    /** A Phosphor icon at the start of the field, decorative. */
    icon?: Icon
  }

/**
 * A text field with its label, help and error: a name, an e-mail, a phone
 * number. Give `type`, `autoComplete` and `inputMode` so phones show the
 * right keyboard.
 *
 * @summary A labelled text field with its error.
 */
function TextField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  icon,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => {
        const props = {
          ...inputProps,
          ...control,
          name,
          value,
          onBlur,
          onChange: (event: ChangeEvent<HTMLInputElement>) =>
            onValueChange(event.target.value),
        }
        return icon ? (
          <InputWithIcon icon={icon} {...props} />
        ) : (
          <Input {...props} />
        )
      }}
    </FieldShell>
  )
}

export { TextField }
export type { TextFieldProps }
