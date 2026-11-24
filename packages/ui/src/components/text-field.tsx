import type { ChangeEvent, ComponentProps } from 'react'
import type { Icon } from '@phosphor-icons/react'

import type { FieldValueProps } from '../internal/field-props.ts'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { FieldShell } from './field-shell.tsx'
import { Input } from './input.tsx'
import { InputWithIcon } from './input-with-icon.tsx'

type TextFieldProps = FieldValueProps<string> &
  Omit<
    ComponentProps<typeof Input>,
    'id' | 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
  > & {
    label: string
    /** A Phosphor icon at the start of the field, decorative. */
    icon?: Icon
  }

/**
 * A labelled one-line text, with its help and its error.
 *
 * **Use it for** a name, an e-mail, a phone, an address in a form.
 * **Prefer** `MoneyField`, `DateField`, `PasswordField`, `TextareaField`
 * for those values.
 *
 * **Where**: in a form, one per line; side by side only for short pairs
 * (first name, last name) on a computer.
 *
 * **States**: empty, filled, focus, disabled, invalid (`error` shown under
 * it and linked to it). The help and the error slide in, their words
 * rising into place (FieldShell, after Arc UI).
 *
 * **Key props**: `label`, `value` + `onValueChange` (controlled) or
 * `defaultValue` (uncontrolled, no state to write), `error` (the message,
 * shown after a blur or a submit), `description` (help under the label),
 * `icon`, plus `type`, `autoComplete`, `inputMode`, `size`.
 * With TanStack Form: `<field.TextField label="…" />`.
 *
 * **Accessibility**: label, help and error are wired with `aria-describedby`
 * and `aria-invalid`.
 *
 * @summary A labelled text field with its error.
 */
function TextField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  icon,
  ...inputProps
}: TextFieldProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
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
            setValue(event.target.value),
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
