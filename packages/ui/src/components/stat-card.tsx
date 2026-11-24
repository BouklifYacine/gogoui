import type { ReactNode } from 'react'
import { ArrowDownRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { subtle } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

/** The words StatCard writes, to change on one StatCard only. */
type StatCardLabels = Partial<
  Pick<GoGoUIMessages, 'trendFlat' | 'trendUp' | 'trendDown'>
>

type StatCardProps = {
  /** What is counted: « Demandes ce mois-ci ». */
  label: string
  /** The figure, already formatted: « 24 », « 18 400 € ». */
  value: ReactNode
  /**
   * The change against the period before, as a share: 0.2 for +20 %.
   * Absent: no change shown.
   */
  change?: number
  /** The period it is compared to: « vs octobre ». */
  changeLabel?: string
  /** A fall is the good news (cancellations, a delay): green when down. */
  lowerIsBetter?: boolean
  icon?: ReactNode
  /** The icon's tile tint; a plain grey icon without it. */
  color?: Color
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: StatCardLabels
}

/**
 * A key figure and how it moved.
 *
 * **Use it for** a dashboard's top line: revenue, signed quotes, visits.
 *
 * **Where**: a row of 2 to 4 at the top of a dashboard.
 *
 * **Key props**: `label`, `value` (already formatted), `change` (a
 * number, in %), `changeLabel` (« vs mois dernier »), `lowerIsBetter`
 * (green when it drops), `icon`, `color`, `labels` to change its words.
 *
 * **Accessibility**: the change is told in words and sign, not colour.
 *
 * @summary A key figure and how it moved.
 */
function StatCard({
  label,
  value,
  change,
  changeLabel,
  lowerIsBetter = false,
  icon,
  color,
  className,
  labels,
}: StatCardProps) {
  const messages = useGoGoUIMessages(labels)
  const percent =
    change === undefined
      ? null
      : new Intl.NumberFormat(messages.intlLocale, {
          style: 'percent',
          maximumFractionDigits: 1,
        }).format(Math.abs(change))
  const up = (change ?? 0) > 0
  const flat = change === 0
  const good = flat ? null : up !== lowerIsBetter
  const Arrow = up ? ArrowUpRightIcon : ArrowDownRightIcon

  return (
    <div
      data-slot="stat-card"
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-line bg-card p-4 shadow-xs',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">{label}</p>
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              '[&_svg]:size-4.5',
              color
                ? cn(
                    'flex size-8 items-center justify-center rounded-lg',
                    subtle[color],
                  )
                : 'text-fg-subtle',
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-title text-fg tabular-nums">
        {value}
      </p>
      {percent !== null && (
        <p className="flex flex-wrap items-center gap-x-1.5 text-sm">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium tabular-nums',
              good === null
                ? 'text-fg-muted'
                : good
                  ? 'text-success-fg'
                  : 'text-danger-fg',
            )}
          >
            {!flat && <Arrow aria-hidden="true" className="size-3.5" />}
            <span aria-hidden="true">
              {flat ? percent : `${up ? '+' : '−'}${percent}`}
            </span>
            <span className="sr-only">
              {flat
                ? messages.trendFlat
                : up
                  ? messages.trendUp(percent)
                  : messages.trendDown(percent)}
            </span>
          </span>
          {changeLabel && <span className="text-fg-subtle">{changeLabel}</span>}
        </p>
      )}
    </div>
  )
}

export { StatCard }
export type { StatCardProps, StatCardLabels }
