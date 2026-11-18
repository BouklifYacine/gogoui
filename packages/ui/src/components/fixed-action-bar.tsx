import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'

type FixedActionBarProps = {
  /** What the band holds, for a screen reader (« Actions du devis »). */
  label: string
  children: ReactNode
  className?: string
}

/**
 * On a phone, a page's next step stays under the thumb while scrolling: a
 * band fixed at the bottom, what it is about on the left (a total), its
 * action on the right. A spacer of its height ends the page, so its last
 * block is never hidden. Hidden from 768 px, where the page shows the same
 * action in its place. Above a bottom tab bar, set `--fixed-bar-offset`
 * to the bar's height.
 *
 * @summary A phone's action band fixed at the bottom.
 */
function FixedActionBar({ label, children, className }: FixedActionBarProps) {
  return (
    <>
      <div aria-hidden="true" className="h-16 md:hidden" />
      <div
        role="group"
        aria-label={label}
        data-slot="fixed-action-bar"
        className={cn(
          'fixed inset-x-0 bottom-(--fixed-bar-offset,0px) z-20 flex items-center gap-2 border-t border-line bg-surface px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden',
          className,
        )}
      >
        {children}
      </div>
    </>
  )
}

export { FixedActionBar }
export type { FixedActionBarProps }
