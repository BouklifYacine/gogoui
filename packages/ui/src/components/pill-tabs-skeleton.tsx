import { cn } from '../lib/cn.ts'

type PillTabsSkeletonProps = {
  /** Each tab's label, or its label and count: the tray takes their width. */
  tabs: (string | { label: string; count: string })[]
  className?: string
}

/**
 * Pill tabs while they load.
 *
 * @summary Pill tabs while they load.
 */
function PillTabsSkeleton({ tabs, className }: PillTabsSkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'inline-flex h-9 w-fit shrink-0 animate-[pulse_1s_ease-in-out_infinite] items-center gap-1 rounded-full bg-line-strong p-1 text-sm font-medium text-transparent max-md:h-11 motion-reduce:animate-none',
        className,
      )}
    >
      {tabs.map((tab) =>
        typeof tab === 'string' ? (
          <span key={tab} className="px-3">
            {tab}
          </span>
        ) : (
          <span key={tab.label} className="flex items-center gap-1.5 px-3">
            {tab.label}
            <span className="min-w-5 px-1.5 text-xs leading-5">
              {tab.count}
            </span>
          </span>
        ),
      )}
    </div>
  )
}

export { PillTabsSkeleton }
export type { PillTabsSkeletonProps }
