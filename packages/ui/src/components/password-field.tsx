import { useCallback, useRef } from 'react'
import { animate, m, useMotionValue } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import { describedBy } from '../internal/field-props.ts'
import type { FieldValueProps } from '../internal/field-props.ts'
import { MotionFeatures } from '../internal/motion-features.tsx'
import { useControllableState } from '../internal/use-controllable-state.ts'
import { FieldShell } from './field-shell.tsx'
import { PasswordInput } from './password-input.tsx'
import type { PasswordInputLabels } from './password-input.tsx'
import { PasswordStrength } from './password-strength.tsx'
import type {
  PasswordRule,
  PasswordStrengthLabels,
} from './password-strength.tsx'

/** The words PasswordField writes, and its strength meter's, to change on one field only. */
type PasswordFieldLabels = PasswordInputLabels & PasswordStrengthLabels

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
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: PasswordFieldLabels
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
 * `minLength`, `rules`, `value` + `onValueChange` (controlled) or
 * `defaultValue` (uncontrolled), `error`, `size`, `labels` to change its
 * words.
 *
 * **Accessibility**: the show button says what it will do; password
 * managers fill it thanks to `autoComplete`. A new password is described
 * by its help, its error and its list of conditions, so they are read
 * with the field. No nudge with reduced motion.
 *
 * @summary A labelled password, with its strength when new.
 */
function PasswordField({
  id,
  name,
  label,
  description,
  error,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onBlur,
  autoComplete,
  minLength,
  rules,
  size,
  className,
  labels,
}: PasswordFieldProps) {
  const reduce = useReduceMotion()
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const shake = useMotionValue(0)
  const lastError = useRef(error)
  const isNew = autoComplete === 'new-password'

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
            <MotionFeatures>
              <m.div style={{ x: shake }}>
                <PasswordInput
                  {...control}
                  // The conditions are part of the field's instructions:
                  // read after its help and its error.
                  aria-describedby={describedBy(
                    control['aria-describedby'],
                    isNew && `${control.id}-rules`,
                  )}
                  name={name}
                  autoComplete={autoComplete}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  size={size}
                  className={className}
                  required
                  labels={labels}
                  value={value}
                  onBlur={onBlur}
                  onChange={(event) => setValue(event.target.value)}
                />
              </m.div>
            </MotionFeatures>
          </div>
          {isNew && (
            <PasswordStrength
              password={value}
              minLength={minLength}
              rules={rules}
              rulesId={`${control.id}-rules`}
              labels={labels}
            />
          )}
        </>
      )}
    </FieldShell>
  )
}

export { PasswordField }
export type { PasswordFieldLabels, PasswordFieldProps }
