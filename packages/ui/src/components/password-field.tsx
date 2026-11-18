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
  className?: string
}

/**
 * A password with its label, help and error, an eye to show it. A new
 * password shows how strong it is under it; one typed to sign in does not.
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
