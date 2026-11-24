import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'

type FixedActionBarProps = {
  /** What the band holds, for a screen reader (« Actions du devis »). */
  label: string
  children: ReactNode
  className?: string
}

/**
 * A phone's band of actions fixed at the bottom of the screen.
 *
 * **Use it for** a long form or a record on a phone, so its main button
 * stays under the thumb. On a computer it sits in the flow.
 *
 * **Key props**: `label` (names the band), children (the buttons, main one
 * last).
 *
 * **Accessibility**: a named region; the page leaves room under it.
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
          // Above the home indicator, unless the project's offset (a tab bar)
          // already counts it: it then sets --fixed-bar-safe-area to 0px.
          'fixed inset-x-0 bottom-(--fixed-bar-offset,0px) z-20 flex items-center gap-2 border-t border-line bg-surface px-4 py-2 pb-[calc(0.5rem+var(--fixed-bar-safe-area,env(safe-area-inset-bottom)))] md:hidden',
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
