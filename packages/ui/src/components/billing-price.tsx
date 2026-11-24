import { AnimatePresence, motion } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { duration, ease, spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { swapFade, swapRise } from '../internal/swap-variants.ts'
import { useElementSize } from '../internal/use-element-size.ts'
import { cn } from '../lib/cn.ts'
import { RollingNumber } from './rolling-number.tsx'

/** The words BillingPrice writes, to change on one BillingPrice only. */
type BillingPriceLabels = Partial<Pick<GoGoUIMessages, 'billingWasPrice'>>

type BillingPriceProps = {
  amount: number
  /** The former price, struck out beside it when higher than `amount`. */
  was?: number
  /** After the price (« / mois »): it swaps in place when it changes. */
  period?: string
  /** Digits after the comma, none by default. */
  decimals?: number
  /** An ISO 4217 code, the euro by default. */
  currency?: string
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: BillingPriceLabels
}

/**
 * A price that rolls to its new amount, after Arc UI's billing toggle
 * (https://uiarc.dev, MIT).
 *
 * **Use it for** the price of a plan under a `BillingToggle`, a total that
 * follows a choice. **Not for** an amount the person types (`MoneyField`)
 * or a figure without currency (`RollingNumber`).
 *
 * **Where**: in a plan card or a pricing table, under the plan's name.
 *
 * **States**: price alone; with its former price struck out (`was`); with
 * its period.
 *
 * **Compose**: below a `BillingToggle`; inside a `Card`.
 *
 * **Key props**: `amount`, `was`, `period`, `decimals`, `currency`. The
 * amount is written by Intl in the provider's language (« 29 € »),
 * `labels` to change its words.
 *
 * **Motion**: the digits roll (`RollingNumber`); the former price opens in
 * width and the period changes width without a jump. With reduced motion
 * everything changes at once.
 *
 * **Accessibility**: the price is read once as text; the former price is
 * read « au lieu de 39 € ».
 *
 * @summary A price that rolls to its new amount, with its former price.
 */
function BillingPrice({
  amount,
  was,
  period,
  decimals = 0,
  currency = 'EUR',
  className,
  labels,
}: BillingPriceProps) {
  const messages = useGoGoUIMessages(labels)
  const reduce = useReduceMotion()
  const [periodSize, measurePeriod] = useElementSize<HTMLSpanElement>()
  const format: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }
  const showWas = was !== undefined && was > amount
  const wasText =
    was === undefined
      ? ''
      : new Intl.NumberFormat(messages.intlLocale, format).format(was)
  const opening = reduce
    ? { duration: 0 }
    : {
        ...spring.smooth,
        opacity: { duration: duration.standard, ease: ease.enter },
      }

  return (
    <MotionScope>
      <span
        data-slot="billing-price"
        className={cn(
          'inline-flex min-w-0 flex-wrap items-end gap-x-2.5 gap-y-1',
          className,
        )}
      >
        <span className="text-3xl leading-none font-medium tracking-tight text-fg">
          <RollingNumber value={amount} format={format} />
        </span>
        <span className="inline-flex items-baseline pb-0.5 text-sm whitespace-nowrap text-fg-muted">
          <AnimatePresence initial={false}>
            {showWas && (
              <motion.span
                key="was"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{
                  opacity: 0,
                  width: 0,
                  transition: reduce
                    ? { duration: 0 }
                    : {
                        ...spring.smooth,
                        opacity: { duration: duration.fast },
                      },
                }}
                transition={opening}
                className="inline-block overflow-x-clip"
              >
                <del className="inline-block pr-1.5 tabular-nums decoration-1">
                  <span className="sr-only">
                    {messages.billingWasPrice(wasText)}
                  </span>
                  <span aria-hidden="true">{wasText}</span>
                </del>
              </motion.span>
            )}
          </AnimatePresence>
          {period && (
            <motion.span
              initial={false}
              animate={periodSize ? { width: periodSize.width } : undefined}
              transition={reduce ? { duration: 0 } : spring.smooth}
              className="relative inline-block overflow-x-clip [overflow-clip-margin:2px]"
            >
              <span
                ref={measurePeriod}
                aria-hidden="true"
                className="invisible inline-block"
              >
                {period}
              </span>
              <AnimatePresence initial={false}>
                <motion.span
                  key={period}
                  variants={reduce ? swapFade : swapRise}
                  initial="hidden"
                  animate="shown"
                  exit="gone"
                  className="absolute top-0 left-0 inline-block"
                >
                  {period}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          )}
        </span>
      </span>
    </MotionScope>
  )
}

export { BillingPrice }
export type { BillingPriceProps, BillingPriceLabels }
