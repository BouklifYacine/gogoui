import type { CSSProperties } from 'react'

import { cn } from '../lib/cn.ts'

export type ChartLegendItem = {
  key: string
  label: string
  /** A CSS colour (`var(--chart-1)`). */
  color: string
  /** A dashed swatch, for a dashed series. */
  dashed?: boolean
}

/**
 * A chart's series switches, after Arc UI's line chart
 * (https://uiarc.dev, MIT): a line swatch beside each name. A hidden
 * series keeps its place: its swatch shrinks and fades, its name steps
 * back and is struck through. Each switch is a toggle button
 * (`aria-pressed`) in a named group.
 *
 * @summary Internal: a chart's legend of series that show or hide.
 */
export function ChartLegend({
  label,
  items,
  hidden,
  onToggle,
}: {
  /** The group's name for a screen reader. */
  label: string
  items: readonly ChartLegendItem[]
  hidden: readonly string[]
  onToggle: (key: string) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-2 flex min-w-0 flex-wrap gap-x-1 gap-y-0.5"
    >
      {items.map((item) => {
        const off = hidden.includes(item.key)
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={!off}
            onClick={() => onToggle(item.key)}
            style={{ '--series': item.color } as CSSProperties}
            className={cn(
              'group inline-flex min-h-8 items-center gap-2 rounded-full pr-2.5 pl-2 text-sm text-fg-muted transition-[color,background-color,scale] duration-150 ease-standard select-none hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus active:scale-97 motion-reduce:transition-none max-md:min-h-11',
              off && 'text-fg-subtle',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'relative h-2.5 w-3.5 flex-none before:absolute before:top-1/2 before:left-0 before:h-[2.5px] before:w-full before:origin-left before:-translate-y-1/2 before:rounded-xs before:transition-[scale,opacity] before:duration-200 before:ease-spring before:content-[""] motion-reduce:before:transition-none',
                item.dashed
                  ? 'before:bg-[repeating-linear-gradient(to_right,var(--series)_0_4px,transparent_4px_7px)]'
                  : 'before:bg-(--series)',
                off && 'before:scale-x-35 before:opacity-45',
              )}
            />
            <span
              className={cn(
                'whitespace-nowrap transition-opacity duration-150 motion-reduce:transition-none',
                off &&
                  'line-through decoration-[color-mix(in_oklab,currentColor_55%,transparent)] opacity-72',
              )}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
