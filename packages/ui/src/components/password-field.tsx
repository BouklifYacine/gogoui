import { useCallback, useRef } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { FieldShell } from './field-shell.tsx'
import { PasswordInput } from './password-input.tsx'
import { PasswordStrength } from './password-strength.tsx'
import type { PasswordRule } from './password-strength.tsx'

type PasswordFieldProps = FieldValueProps<string> & {
  label: string
  /** current-password to sign in, new-password to sign up. */
  autoComplete: 'current-password' | 'new-password'
  /** A new password's minimum, for its strength bars. */
  minLength?: number
  /** A new password's list of conditions; GoGoUI's score's by default. */
  rules?: PasswordRule[]
  /** The field's height: sm, default or lg. */
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

// Released sideways, the spring rings out on its own: the refused field
// nudges once, the way a phone shakes a wrong code.
const nudge = {
  type: 'spring',
  velocity: -240,
  stiffness: 900,
  damping: 57,
  restDelta: 0.1,
} as const

/**
 * A labelled password, with its strength when it is new.
 *
 * **Use it for** sign-in (`autoComplete="current-password"`) and sign-up
 * or reset (`autoComplete="new-password"`, shows `PasswordStrength`).
 *
 * **States**: hidden, shown (the eye button), weak to strong with its
 * list of conditions, invalid: the field nudges sideways once each time a
 * new error appears (after Arc UI), and the error slides in.
 *
 * **Key props**: `label`, `autoComplete` (required: it picks the mode),
 * `minLength`, `rules`, `value` + `onValueChange`, `error`, `size`.
 *
 * **Accessibility**: the show button says what it will do; password
 * managers fill it thanks to `autoComplete`. No nudge with reduced motion.
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
  rules,
  size,
  className,
}: PasswordFieldProps) {
  const reduce = useReduceMotion()
  const shake = useMotionValue(0)
  const lastError = useRef(error)

  // A new ref each time the error changes: React calls it again, and a
  // new message (not the one there at load) nudges the field.
  const nudgeOnNewError = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        return
      }
      const previous = lastError.current
      lastError.current = error
      if (error && error !== previous && !reduce) {
        animate(shake, 0, nudge)
      }
    },
    [error, reduce, shake],
  )

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
          <div ref={nudgeOnNewError}>
            <motion.div style={{ x: shake }}>
              <PasswordInput
                {...control}
                name={name}
                autoComplete={autoComplete}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                size={size}
                className={className}
                required
                value={value}
                onBlur={onBlur}
                onChange={(event) => onValueChange(event.target.value)}
              />
            </motion.div>
          </div>
          {autoComplete === 'new-password' && (
            <PasswordStrength
              password={value}
              minLength={minLength}
              rules={rules}
            />
          )}
        </>
      )}
    </FieldShell>
  )
}

export { PasswordField }
export type { PasswordFieldProps }
