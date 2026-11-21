import { MotionConfig, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'

const levelColours = [
  { bar: 'bg-danger', text: 'text-danger-fg' },
  { bar: 'bg-warning', text: 'text-warning-fg' },
  { bar: 'bg-caution', text: 'text-caution-fg' },
  { bar: 'bg-success', text: 'text-success-fg' },
  { bar: 'bg-success', text: 'text-success-fg' },
] as const

const fill = { type: 'spring', stiffness: 260, damping: 24 } as const
const rise = { type: 'spring', stiffness: 300, damping: 24 } as const

/**
 * 0 under the minimum, then 1 to 4. Length counts most (a long phrase
 * beats a short jumble, as NIST advises): 14 and 18 characters each add a
 * step, and so does mixing three kinds of characters. Leaked passwords
 * are your API's to refuse.
 */
function passwordScore(password: string, minLength = 10): number {
  if (password.length < minLength) {
    return 0
  }
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((kind) =>
    kind.test(password),
  ).length
  return Math.min(
    4,
    1 +
      Number(password.length >= 14) +
      Number(password.length >= 18) +
      Number(kinds >= 3),
  )
}

type PasswordStrengthProps = {
  password: string
  /** Below it the password is refused: match your API's minimum. */
  minLength?: number
}

/**
 * Four bars telling how strong a new password is.
 *
 * **Use it for** under a new password; `PasswordField` already includes
 * it.
 *
 * **Key props**: `password`, `minLength`.
 *
 * **Accessibility**: the level is written in words and read politely.
 *
 * @summary Four bars telling how strong a new password is.
 */
function PasswordStrength({ password, minLength = 10 }: PasswordStrengthProps) {
  const messages = useGoGoUIMessages()
  const score = passwordScore(password, minLength)
  const word = messages.passwordLevels[score]
  const colours = levelColours[score]
  const missing = minLength - password.length

  return (
    <MotionConfig reducedMotion="user">
      <div data-slot="password-strength" className="flex flex-col gap-1.5">
        <div aria-hidden="true" className="flex gap-1.5">
          {[0, 1, 2, 3].map((bar) => (
            <span
              key={bar}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-tray"
            >
              <motion.span
                className={cn(
                  'absolute inset-y-0 start-0 rounded-full transition-colors duration-300',
                  colours.bar,
                )}
                initial={false}
                animate={{ width: bar < score ? '100%' : '0%' }}
                transition={{ ...fill, delay: bar * 0.06 }}
              />
            </span>
          ))}
        </div>
        {/* Kept in place so the change is read: a region that appears is
            not. */}
        <span aria-live="polite" className="sr-only">
          {password.length > 0 ? messages.passwordStatus(word) : ''}
        </span>
        {password.length > 0 && (
          <div
            aria-hidden="true"
            className="flex justify-between gap-3 text-sm"
          >
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={rise}
              className={cn('font-medium', colours.text)}
            >
              {word}
            </motion.span>
            <span className="text-fg-subtle">
              {missing > 0
                ? messages.passwordMissing(missing)
                : score < 4
                  ? messages.passwordLonger
                  : null}
            </span>
          </div>
        )}
      </div>
    </MotionConfig>
  )
}

export { PasswordStrength, passwordScore }
export type { PasswordStrengthProps }
