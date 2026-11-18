import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './empty.tsx'

type EmptyStateProps = {
  title: ReactNode
  /**
   * Makes a text title a heading at its place in the page: 2 under the
   * page's h1, 3 inside a section. None: a plain paragraph.
   */
  headingLevel?: 2 | 3
  /** What it means, and what to do next. */
  description?: ReactNode
  icon?: ReactNode
  /** The way out: the button that adds the first one. */
  action?: ReactNode
  /** « large »: the whole page is empty, the state is its centre. */
  size?: 'default' | 'large'
  className?: string
}

/**
 * A list or a page with nothing yet: what is missing, why it matters, and
 * the button that fills it. Built on `Empty`, in one call.
 *
 * @summary An empty list's message and its way out.
 */
function EmptyState({
  title,
  headingLevel,
  description,
  icon,
  action,
  size = 'default',
  className,
}: EmptyStateProps) {
  const Title = headingLevel ? (`h${headingLevel}` as const) : 'p'
  const large = size === 'large'

  return (
    <Empty
      data-slot="empty-state"
      className={cn('border border-line', large && 'gap-6 py-16', className)}
    >
      <EmptyHeader className={cn(large && 'max-w-md gap-3')}>
        {icon && (
          <EmptyMedia
            variant="icon"
            className={cn(
              large && "size-16 [&_svg:not([class*='size-'])]:size-8",
            )}
          >
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle className={cn(large && 'text-2xl')}>
          {typeof title === 'string' ? <Title>{title}</Title> : title}
        </EmptyTitle>
        {description && (
          <EmptyDescription className={cn(large && 'text-base/relaxed')}>
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

export { EmptyState }
export type { EmptyStateProps }
