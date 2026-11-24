import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { Variants } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { blur, duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { PasswordRuleMark } from '../internal/password-rule-mark.tsx'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './rolling-number.tsx'

const levelColours = [
  { bar: 'bg-danger', text: 'text-danger-fg' },
  { bar: 'bg-warning', text: 'text-warning-fg' },
  { bar: 'bg-caution', text: 'text-caution-fg' },
  { bar: 'bg-success', text: 'text-success-fg' },
  { bar: 'bg-success', text: 'text-success-fg' },
] as const

/** How many of lowercase, uppercase, digits and symbols it mixes. */
function kindsOf(password: string): number {
  return [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((kind) =>
    kind.test(password),
  ).length
}

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
  return Math.min(
    4,
    1 +
      Number(password.length >= 14) +
      Number(password.length >= 18) +
      Number(kindsOf(password) >= 3),
  )
}

/** One line of the list under the bars. */
type PasswordRule = {
  id: string
  label: string
  test: (password: string) => boolean
  /** Characters still missing: a rolling « encore 4 » beside the first unmet rule that has it. */
  remaining?: (password: string) => number
}

/** The four conditions of `passwordScore`, so the bars and the ticks say the same thing. */
function passwordRules(
  minLength: number,
  messages: GoGoUIMessages,
): PasswordRule[] {
  const length = (id: string, count: number, label: string) => ({
    id,
    label,
    test: (password: string) => password.length >= count,
    remaining: (password: string) => count - password.length,
  })
  return [
    length('min', minLength, messages.passwordRuleMin(minLength)),
    ...[14, 18]
      .filter((count) => count > minLength)
      .map((count) =>
        length(`length-${count}`, count, messages.passwordRuleLength(count)),
      ),
    {
      id: 'kinds',
      label: messages.passwordRuleKinds,
      test: (password: string) => kindsOf(password) >= 3,
    },
  ]
}

/** The level's word rises when it gets better and drops when it gets worse. */
const rise: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: `${0.3 * direction}em`,
    filter: `blur(${blur.soft}px)`,
  }),
  center: {
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: { duration: duration.standard, ease: ease.enter },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${-0.3 * direction}em`,
    filter: `blur(${blur.subtle}px)`,
    transition: { duration: duration.fast, ease: ease.standard },
  }),
}

const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.instant } },
}

/** The words PasswordStrength writes, to change on one PasswordStrength only. */
type PasswordStrengthLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'passwordLevels'
    | 'passwordMeter'
    | 'passwordEmpty'
    | 'passwordRules'
    | 'passwordRemaining'
    | 'passwordRuleMet'
    | 'passwordRuleNotMet'
    | 'passwordStatus'
    | 'passwordRuleMin'
    | 'passwordRuleLength'
    | 'passwordRuleKinds'
  >
>

type PasswordStrengthProps = {
  password: string
  /** Below it the password is refused: match your API's minimum. */
  minLength?: number
  /**
   * The list under the bars; by default the four conditions of the score
   * (the minimum, 14 and 18 characters, three kinds of characters). The
   * bars always follow GoGoUI's score.
   */
  rules?: PasswordRule[]
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: PasswordStrengthLabels
}

/**
 * Four bars and a list of conditions telling how strong a new password
 * is, after Arc UI (https://uiarc.dev, MIT), on GoGoUI's length-first
 * score.
 *
 * **Use it for** under a new password; `PasswordField` already includes
 * it. **Not for** a sign-in field.
 *
 * **States**: empty, too short (with « encore N »), fair, good, strong,
 * very strong. Each bar's fill slides into its track (left to right as it
 * improves, right to left as it falls); the level's word rises when it
 * gets better and drops when it gets worse; a condition met tints its
 * mark and draws its tick, several in a row 50ms apart; the count of
 * missing characters rolls.
 *
 * **Key props**: `password`, `minLength`, `rules` (`{ id, label, test,
 * remaining? }[]`), `labels` to change its words.
 *
 * **Accessibility**: the bars are a `meter` with the level in words; the
 * list says « remplie » or « non remplie » after each condition; the level
 * is read politely as it changes. With reduced motion everything fades.
 *
 * @summary Bars and a self-ticking list telling how strong a password is.
 */
function PasswordStrength({
  password,
  minLength = 10,
  rules: rulesProp,
  labels,
}: PasswordStrengthProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const rules = rulesProp ?? passwordRules(minLength, messages)
  const score = passwordScore(password, minLength)
  const word = messages.passwordLevels[score]
  const colours = levelColours[score]
  const met = new Set(
    rules.filter((rule) => rule.test(password)).map((rule) => rule.id),
  )
  const metKey = [...met].join(' ')

  // The previous score and ticks: which way the word moves, which bars
  // and ticks join the wave, decided here during the render.
  const [track, setTrack] = useState({
    score,
    previousScore: score,
    direction: 1,
    metKey,
    previousMet: metKey,
  })
  if (track.score !== score || track.metKey !== metKey) {
    setTrack({
      score,
      previousScore: track.score === score ? track.previousScore : track.score,
      direction:
        track.score === score ? track.direction : score > track.score ? 1 : -1,
      metKey,
      previousMet: track.metKey === metKey ? track.previousMet : track.metKey,
    })
  }
  const previousMet = new Set(track.previousMet.split(' ').filter(Boolean))
  const changed = rules
    .filter((rule) => met.has(rule.id) !== previousMet.has(rule.id))
    .map((rule) => rule.id)
  const counted = rules.find(
    (rule) =>
      password.length > 0 &&
      !met.has(rule.id) &&
      (rule.remaining?.(password) ?? 0) > 0,
  )

  return (
    <MotionScope>
      <div data-slot="password-strength" className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            role="meter"
            aria-label={messages.passwordMeter}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={score}
            aria-valuetext={password ? word : messages.passwordEmpty}
            className="grid min-w-0 flex-1 grid-cols-4 gap-1.5"
          >
            {[0, 1, 2, 3].map((bar) => {
              const on = bar < score
              // A pasted password fills left to right; clearing empties
              // right to left.
              const wave = on
                ? bar - track.previousScore
                : track.previousScore - 1 - bar
              return (
                <span
                  key={bar}
                  aria-hidden="true"
                  className="relative isolate h-1 overflow-hidden rounded-full bg-tray"
                >
                  {/* The fill slides in its clipped track, so its round
                      ends keep their shape at every frame. */}
                  <m.span
                    className={cn(
                      'absolute inset-0 rounded-full transition-colors duration-200 ease-standard motion-reduce:transition-none',
                      colours.bar,
                    )}
                    initial={false}
                    animate={{ x: on ? '0%' : '-101%' }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            ...spring.smooth,
                            delay: Math.max(0, wave) * (on ? 0.05 : 0.03),
                          }
                    }
                  />
                </span>
              )
            })}
          </div>
          {/* A fixed slot: the bars never resize when the word changes. */}
          <span
            aria-hidden="true"
            className="relative block h-5 w-20 shrink-0 text-right text-sm font-medium whitespace-nowrap"
          >
            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={track.direction}
            >
              {password ? (
                <m.span
                  key={word}
                  custom={track.direction}
                  variants={reduce ? fade : rise}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={cn('inline-block', colours.text)}
                >
                  {word}
                </m.span>
              ) : null}
            </AnimatePresence>
          </span>
        </div>
        <ul aria-label={messages.passwordRules} className="grid gap-1.5">
          {rules.map((rule) => {
            const ok = met.has(rule.id)
            const order = changed.indexOf(rule.id)
            const remaining =
              counted?.id === rule.id ? (rule.remaining?.(password) ?? 0) : 0
            const words = messages.passwordRemaining(remaining)
            const at = words.indexOf(String(remaining))
            return (
              <li
                key={rule.id}
                data-met={ok || undefined}
                className="flex min-h-5 items-center gap-2.5 text-sm text-fg-muted transition-colors duration-200 ease-standard data-met:text-fg motion-reduce:transition-none"
              >
                <PasswordRuleMark
                  met={ok}
                  delay={order > 0 ? order * 0.05 : 0}
                />
                <span className="min-w-0">
                  {rule.label}
                  <span className="sr-only">
                    {ok
                      ? messages.passwordRuleMet
                      : messages.passwordRuleNotMet}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="relative ms-auto block ps-2 text-xs whitespace-pre text-fg-subtle"
                >
                  <AnimatePresence mode="popLayout" initial={false} custom={1}>
                    {remaining > 0 ? (
                      <m.span
                        key="remaining"
                        custom={1}
                        variants={reduce ? fade : rise}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="inline-flex items-baseline"
                      >
                        {words.slice(0, Math.max(at, 0))}
                        <RollingNumber value={remaining} />
                        {at >= 0
                          ? words.slice(at + String(remaining).length)
                          : null}
                      </m.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </li>
            )
          })}
        </ul>
        {/* Kept in place so the change is read: a region that appears is
            not. */}
        <span aria-live="polite" className="sr-only">
          {password ? messages.passwordStatus(word) : ''}
        </span>
      </div>
    </MotionScope>
  )
}

export { PasswordStrength, passwordScore }
export type { PasswordRule, PasswordStrengthProps, PasswordStrengthLabels }
