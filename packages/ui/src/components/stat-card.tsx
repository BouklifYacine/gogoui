import type { ReactNode } from 'react'
import { ArrowDownRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'

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
  className?: string
}

/**
 * A key figure on a dashboard: what it counts, the figure, and how it
 * moved, the direction told by an arrow and in words, its colour saying
 * whether that is good. Put a few side by side in a grid.
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
  className,
}: StatCardProps) {
  const messages = useGoGoUIMessages()
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
          <span aria-hidden="true" className="text-fg-subtle [&_svg]:size-4.5">
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
export type { StatCardProps }
