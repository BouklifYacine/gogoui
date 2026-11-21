import { useState } from 'react'
import { MotionConfig, motion } from 'motion/react'

import type { FieldValueProps } from '../internal/field-props.ts'
import { cn } from '../lib/cn.ts'
import { FieldShell } from './field-shell.tsx'

// A digit lands with a small bounce; the boxes close up on a full code.
const land = { type: 'spring', stiffness: 520, damping: 16 } as const
const close = { type: 'spring', stiffness: 260, damping: 24 } as const
// A refused code shakes, as a head saying no; a good one swells a little.
const shake = { duration: 0.4, ease: 'easeInOut' } as const
const pop = { type: 'spring', stiffness: 420, damping: 12 } as const

type CodeFieldProps = FieldValueProps<string> & {
  label: string
  /** How many digits, 6 by default. */
  length?: number
  /** What your API said of the code: refused, or accepted. */
  status?: 'error' | 'success'
  /** Raise it at each refused try: the boxes shake again. */
  attempt?: number
}

/**
 * A code of digits, one box per digit.
 *
 * **Use it for** a code sent by e-mail or SMS, a two-factor code.
 *
 * **States**: empty, typing, success (green), error (shakes, clears with
 * `attempt`).
 *
 * **Key props**: `label`, `length` (6 by default), `value` +
 * `onValueChange` (submit when full), `status` (error, success), `attempt`
 * (bump it after a wrong code to replay the shake).
 *
 * **Accessibility**: one field for the screen reader; paste and the phone's
 * « code from SMS » fill every box.
 *
 * @summary A code of digits in boxes, for a sign-in.
 */
function CodeField({
  id,
  name,
  label,
  description,
  error,
  value: rawValue,
  onValueChange,
  onBlur,
  length = 6,
  status,
  attempt = 0,
}: CodeFieldProps) {
  const [focused, setFocused] = useState(false)
  const value = rawValue.replace(/\D/g, '').slice(0, length)
  const full = value.length === length
  const invalid = Boolean(error) || status === 'error'
  const success = status === 'success' && !invalid

  // Each refused try shakes again: the try's number names the animation.
  const shaking = `shake-${String(attempt)}`
  const moves = {
    [shaking]: { x: [0, -10, 9, -6, 4, -2, 0], transition: shake },
    pop: { scale: [1, 1.06, 1], transition: pop },
    rest: { x: 0, scale: 1 },
  }
  const move = invalid ? shaking : success ? 'pop' : 'rest'

  return (
    <FieldShell
      id={id}
      name={name}
      label={label}
      description={description}
      error={error}
    >
      {(control) => (
        <MotionConfig reducedMotion="user">
          <div className="relative w-fit">
            <motion.div
              aria-hidden="true"
              className="flex"
              variants={moves}
              initial={false}
              animate={move}
            >
              {Array.from({ length }, (_, index) => {
                const digit = value[index]
                const caret = focused && !full && index === value.length
                return (
                  <motion.span
                    key={index}
                    initial={false}
                    animate={{
                      marginInlineEnd: full || index === length - 1 ? 0 : 8,
                    }}
                    transition={close}
                    className={cn(
                      'relative flex h-14 w-12 items-center justify-center bg-control text-2xl font-semibold text-fg tabular-nums shadow-button transition-[background-color,color,border-radius,box-shadow] duration-300 max-sm:h-12 max-sm:w-10',
                      full
                        ? 'bg-tray shadow-none first:rounded-s-2xl last:rounded-e-2xl'
                        : 'rounded-xl',
                      caret && 'bg-tray',
                      invalid &&
                        'bg-danger-subtle text-danger-fg shadow-none ring-1 ring-danger-line ring-inset',
                      success &&
                        'bg-success-subtle text-success-fg shadow-none ring-1 ring-success-line ring-inset',
                    )}
                  >
                    {digit && (
                      <motion.span
                        key={digit}
                        initial={{ y: -14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={land}
                      >
                        {digit}
                      </motion.span>
                    )}
                    {caret && (
                      <span
                        className={cn(
                          'absolute h-6 w-0.5 animate-pulse rounded-full',
                          invalid ? 'bg-danger-fg' : 'bg-fg',
                        )}
                      />
                    )}
                  </motion.span>
                )
              })}
            </motion.div>
            <input
              {...control}
              name={name}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-invalid={invalid || undefined}
              // No maxLength: « Votre code : 042 817 » pasted whole keeps
              // its digits, the rest is dropped.
              value={value}
              onChange={(event) =>
                onValueChange(
                  event.target.value.replace(/\D/g, '').slice(0, length),
                )
              }
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false)
                onBlur?.()
              }}
              className="absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent"
            />
          </div>
        </MotionConfig>
      )}
    </FieldShell>
  )
}

export { CodeField }
export type { CodeFieldProps }
