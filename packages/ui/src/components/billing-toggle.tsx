import { use, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { animate, motion, useMotionValue } from 'motion/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { useReduceMotion } from '../i18n/motion-context.ts'
import { BillingToggleContext } from '../internal/billing-toggle-context.ts'
import type { Color } from '../internal/colors.ts'
import { spring } from '../internal/motion.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { StableSwap } from '../internal/stable-swap.tsx'
import { cn } from '../lib/cn.ts'

type BillingToggleProps = {
  value: string
  onValueChange: (value: string) => void
  /** The group's name for a screen reader; « Période de facturation » by default. */
  label?: string
  size?: 'sm' | 'default' | 'lg'
  /** The chosen period's saving badge, success (green) by default. */
  color?: Color
  /** The name sent with a form. */
  name?: string
  /** `BillingToggleItem`s; Mensuel (`monthly`) and Annuel (`yearly`) by default. */
  children?: ReactNode
  className?: string
}

const tray = {
  sm: 'p-0.5 text-xs',
  default: 'p-[3px] text-sm',
  lg: 'p-1 text-base',
} as const

const thumbInset = {
  sm: 'inset-y-0.5',
  default: 'inset-y-[3px]',
  lg: 'inset-y-1',
} as const

/**
 * Mensuel / Annuel: the billing period of a price, after Arc UI
 * (https://uiarc.dev, MIT).
 *
 * **Use it for** the period above a pricing table or a plan card. **Not
 * for** tabs that swap a page (`PillTabsList`) or other choices
 * (`ToggleGroup`, `RadioGroup`).
 *
 * **Where**: above the prices it changes, centred or aligned with them.
 *
 * **States**: each period chosen or not; a saving badge that tints and
 * rewrites itself once its period is chosen (« −20 % » → « 2 mois
 * offerts »).
 *
 * **Compose**: `BillingToggle` > `BillingToggleItem`s; the prices below
 * with `BillingPrice`.
 *
 * **Key props**: `value` + `onValueChange`, `label`, `size` (sm, default,
 * lg), `color` (the badge's tint); on an item `value`, `badge`,
 * `activeBadge`.
 *
 * **Motion**: one thumb glides to the chosen period (smooth spring, no
 * bounce); a pressed period sinks to .97; the badge's words swap in
 * place. With reduced motion the thumb lands at once and the badge fades.
 *
 * **Accessibility**: a radio group (one tab stop, arrows choose at once);
 * the badge is part of its period's name, so its change is read.
 *
 * @summary Mensuel / Annuel switch with a gliding thumb and a saving badge.
 */
function BillingToggle({
  value,
  onValueChange,
  label,
  size = 'default',
  color = 'success',
  name,
  children,
  className,
}: BillingToggleProps) {
  const messages = useGoGoUIMessages()
  const reduce = useReduceMotion()
  const x = useMotionValue(0)
  const width = useMotionValue(0)
  const [placed, setPlaced] = useState(false)

  // A callback ref renewed when the value changes: it runs once the items
  // are laid out, so the thumb goes to where the chosen one now is.
  const followChoice = useCallback(
    (marker: HTMLSpanElement | null) => {
      const group = marker?.parentElement
      if (!group) {
        return undefined
      }
      const box = () => {
        const item = group.querySelector<HTMLElement>(
          `[data-billing-value="${CSS.escape(value)}"]`,
        )
        return item ? { x: item.offsetLeft, width: item.offsetWidth } : null
      }
      const target = box()
      if (target && placed && !reduce) {
        animate(x, target.x, spring.smooth)
        animate(width, target.width, spring.smooth)
      } else if (target) {
        x.jump(target.x)
        width.jump(target.width)
      }
      setPlaced(Boolean(target))

      // A font loaded, a wider column: the thumb follows without gliding.
      if (typeof ResizeObserver === 'undefined') {
        return undefined
      }
      const observer = new ResizeObserver(() => {
        const next = box()
        if (next) {
          x.jump(next.x)
          width.jump(next.width)
        }
      })
      observer.observe(group)
      return () => observer.disconnect()
    },
    [value, placed, reduce, x, width],
  )

  return (
    <MotionScope>
      <BillingToggleContext value={{ value, size, color, placed }}>
        <RadioGroupPrimitive
          data-slot="billing-toggle"
          aria-label={label ?? messages.billingPeriod}
          name={name}
          value={value}
          onValueChange={(next) => onValueChange(String(next))}
          className={cn(
            'relative isolate inline-flex max-w-full items-center rounded-full bg-tray ring-1 ring-line-subtle ring-inset',
            tray[size],
            className,
          )}
        >
          <span ref={followChoice} hidden />
          <motion.span
            aria-hidden="true"
            style={{ x, width }}
            className={cn(
              'pointer-events-none absolute left-0 -z-1 rounded-full bg-control shadow-button will-change-[transform,width]',
              thumbInset[size],
              !placed && 'invisible',
            )}
          />
          {children ?? (
            <>
              <BillingToggleItem value="monthly">
                {messages.billingMonthly}
              </BillingToggleItem>
              <BillingToggleItem value="yearly">
                {messages.billingYearly}
              </BillingToggleItem>
            </>
          )}
        </RadioGroupPrimitive>
      </BillingToggleContext>
    </MotionScope>
  )
}

const item = {
  sm: 'h-7 px-3 has-data-[slot=billing-badge]:pr-1',
  default: 'h-8.5 px-3.5 has-data-[slot=billing-badge]:pr-1.5',
  lg: 'h-10.5 px-4.5 has-data-[slot=billing-badge]:pr-1.5',
} as const

const badgeHeight = {
  sm: 'h-5 px-1.5',
  default: 'h-6 px-2',
  lg: 'h-8 px-2.5',
} as const

const badgeTint: Record<Color, string> = {
  neutral: 'bg-neutral-subtle text-neutral-fg',
  primary: 'bg-primary-subtle text-primary-active',
  info: 'bg-info-subtle text-info-fg',
  success: 'bg-success-subtle text-success-fg',
  warning: 'bg-warning-subtle text-warning-fg',
  danger: 'bg-danger-subtle text-danger-fg',
}

type BillingToggleItemProps = {
  value: string
  /** The period's word. */
  children: ReactNode
  /** A short saving note (« −20 % »). */
  badge?: string
  /** The note once this period is chosen (« 2 mois offerts »); `badge` by default. */
  activeBadge?: string
  disabled?: boolean
  className?: string
}

function BillingToggleItem({
  value,
  children,
  badge,
  activeBadge,
  disabled,
  className,
}: BillingToggleItemProps) {
  const toggle = use(BillingToggleContext)
  const chosen = toggle.value === value
  const badgeText = chosen ? (activeBadge ?? badge) : badge
  const candidates = [badge, activeBadge].filter((text): text is string =>
    Boolean(text),
  )
  return (
    <RadioPrimitive.Root
      value={value}
      disabled={disabled}
      data-slot="billing-toggle-item"
      data-billing-value={value}
      className={cn(
        'relative inline-flex min-w-0 cursor-pointer items-center rounded-full font-medium whitespace-nowrap text-fg-muted outline-none select-none transition-colors duration-150 ease-standard hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus data-checked:cursor-default data-checked:text-fg data-disabled:cursor-not-allowed data-disabled:opacity-60',
        // Before the thumb is measured, the chosen period paints its own.
        !toggle.placed && 'data-checked:bg-control data-checked:shadow-button',
        item[toggle.size],
        className,
      )}
    >
      <span className="relative inline-flex items-center gap-2 transition-[scale] duration-150 ease-standard [:not([data-checked]):active>&]:scale-[0.97]">
        {children}
        {badgeText && (
          <span
            data-slot="billing-badge"
            className={cn(
              'inline-flex items-center rounded-full text-xs font-medium tabular-nums transition-colors duration-200 ease-standard',
              badgeHeight[toggle.size],
              chosen ? badgeTint[toggle.color] : 'bg-fg/6 text-fg-muted',
            )}
          >
            <StableSwap text={badgeText} candidates={candidates} />
          </span>
        )}
      </span>
    </RadioPrimitive.Root>
  )
}

export { BillingToggle, BillingToggleItem }
export type { BillingToggleItemProps, BillingToggleProps }
