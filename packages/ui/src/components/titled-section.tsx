import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'

type TitledSectionProps = {
  /** The heading's id: the section is named by it for screen readers. */
  id: string
  title: string
  /** Something small beside the title (an `InfoTip`). */
  aside?: ReactNode
  /** A panel's part: a smaller title, closer to its content. */
  compact?: boolean
  children: ReactNode
  className?: string
}

/**
 * A part of a page under its h2, named by its title. The h2 can take the
 * focus: when an action removes the button that had it, send the focus to
 * the section's title rather than losing it.
 *
 * @summary A part of a page under its title.
 */
function TitledSection({
  id,
  title,
  aside,
  compact = false,
  children,
  className,
}: TitledSectionProps) {
  const heading = (
    <h2
      id={id}
      tabIndex={-1}
      className={cn(
        'font-medium text-fg outline-none',
        compact ? 'text-base' : 'text-xl',
      )}
    >
      {title}
    </h2>
  )
  return (
    <section
      aria-labelledby={id}
      data-slot="titled-section"
      className={cn('flex flex-col', compact ? 'gap-3' : 'gap-4', className)}
    >
      {aside ? (
        <div className="flex items-center gap-2">
          {heading}
          {aside}
        </div>
      ) : (
        heading
      )}
      {children}
    </section>
  )
}

export { TitledSection }
export type { TitledSectionProps }
