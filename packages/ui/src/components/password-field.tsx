import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldShell } from './field-shell.tsx'
import { PasswordInput } from './password-input.tsx'
import { PasswordStrength } from './password-strength.tsx'

type PasswordFieldProps = FieldValueProps<string> & {
  label: string
  /** current-password to sign in, new-password to sign up. */
  autoComplete: 'current-password' | 'new-password'
  /** A new password's minimum, for its strength bars. */
  minLength?: number
  /** The field's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * A labelled password, with its strength when it is new.
 *
 * **Use it for** sign-in (`autoComplete="current-password"`) and sign-up
 * or reset (`autoComplete="new-password"`, shows `PasswordStrength`).
 *
 * **States**: hidden, shown (the eye button), weak to strong, invalid.
 *
 * **Key props**: `label`, `autoComplete` (required: it picks the mode),
 * `minLength`, `value` + `onValueChange`, `error`, `size`.
 *
 * **Accessibility**: the show button says what it will do; password
 * managers fill it thanks to `autoComplete`.
 *
 * @summary A labelled password, with its strength when new.
 */
function PasswordField({
  id,
  name,
  label,
  description,
  error,
  value,
  onValueChange,
  onBlur,
  autoComplete,
  minLength,
  size,
  className,
}: PasswordFieldProps) {
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
          <PasswordInput
            {...control}
            name={name}
            autoComplete={autoComplete}
            size={size}
            className={className}
            required
            value={value}
            onBlur={onBlur}
            onChange={(event) => onValueChange(event.target.value)}
          />
          {autoComplete === 'new-password' && (
            <PasswordStrength password={value} minLength={minLength} />
          )}
        </>
      )}
    </FieldShell>
  )
}

export { PasswordField }
export type { PasswordFieldProps }
