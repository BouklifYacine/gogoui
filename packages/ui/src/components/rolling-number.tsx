import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { spring, stagger } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { RollingDigit } from '../internal/rolling-digit.tsx'
import { rollingParts } from '../internal/rolling-parts.ts'
import { cn } from '../lib/cn.ts'

type RollingNumberProps = {
  value: number
  /** How the number is written (currency, decimals, percent…), through Intl. */
  format?: Intl.NumberFormatOptions
  /** Words before and after the number, which do not roll. */
  prefix?: string
  suffix?: string
  /** Rolls every digit up from 0 the first time the number is seen. */
  animateOnView?: boolean
  className?: string
}

/**
 * A number whose digits roll to their new value, each on its own wheel,
 * after Arc UI's animated counter (https://uiarc.dev, MIT).
 *
 * **Use it for** a figure that changes in place: a price that follows the
 * billing period, a count, a key figure. **Not for** words that change
 * (`RollingLine`) or a number the person types (`NumberField`).
 *
 * **Where**: inline, in the text size of its parent.
 *
 * **States**: rising (wheels turn up), falling (they turn down), a new
 * column opening on the left (999 → 1 000), first view (`animateOnView`).
 *
 * **Compose**: inside a `StatCard`, a heading or a `BillingPrice`.
 *
 * **Key props**: `value`, `format` (`Intl.NumberFormatOptions`, e.g.
 * `{ style: 'currency', currency: 'EUR' }`), `prefix`, `suffix`,
 * `animateOnView`. The language's locale comes from GoGoUIProvider.
 *
 * **Accessibility**: the whole number is read once, as text; the wheels
 * are hidden from screen readers. With reduced motion the digits change
 * at once.
 *
 * @summary A number whose digits roll to their new value.
 */
function RollingNumber({
  value,
  format,
  prefix = '',
  suffix = '',
  animateOnView = false,
  className,
}: RollingNumberProps) {
  const { intlLocale } = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })

  // Which way the number moved, kept from one value to the next.
  const [previous, setPrevious] = useState(value)
  const [direction, setDirection] = useState(1)
  if (value !== previous) {
    setPrevious(value)
    setDirection(value > previous ? 1 : -1)
  }

  const parts = rollingParts(value, intlLocale, format)
  const text = `${prefix}${parts.map((part) => ('text' in part ? part.text : part.digit)).join('')}${suffix}`
  const armed = animateOnView && !inView && !reduce
  const opening = reduce ? { duration: 0 } : spring.morph

  return (
    <MotionScope>
      <span
        ref={ref}
        data-slot="rolling-number"
        className={cn('relative inline-flex tabular-nums', className)}
      >
        <span className="sr-only">{text}</span>
        <span
          aria-hidden="true"
          className="inline-flex items-start whitespace-nowrap select-none"
        >
          {prefix && <span className="inline-block">{prefix}</span>}
          <AnimatePresence initial={false}>
            {parts.map((part) =>
              'digit' in part ? (
                <RollingDigit
                  key={part.key}
                  digit={part.digit}
                  direction={direction}
                  armed={armed}
                  delay={Math.min(part.order * stagger.item, 0.25)}
                />
              ) : (
                <motion.span
                  key={part.key}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={opening}
                  className="inline-block overflow-x-clip whitespace-pre"
                >
                  {part.text}
                </motion.span>
              ),
            )}
          </AnimatePresence>
          {suffix && <span className="inline-block">{suffix}</span>}
        </span>
      </span>
    </MotionScope>
  )
}

export { RollingNumber }
export type { RollingNumberProps }
