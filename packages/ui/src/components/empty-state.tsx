import type { ReactNode } from 'react'

import { subtle } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
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
  /** The icon's round tint; grey by default. */
  color?: Color
  className?: string
}

/**
 * A list or a page with nothing yet, in one call.
 *
 * **Use it for** the first time a list is empty, a search with no result,
 * an empty page. Say what is missing and offer the way out.
 *
 * **Where**: in place of the list or the page's content.
 *
 * **Key props**: `title`, `description`, `icon`, `action` (the button that
 * fills it), `size` (default, large for a whole page), `headingLevel`,
 * `color` (the icon's tint).
 *
 * **Accessibility**: `headingLevel` makes the title a heading at its place.
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
  color,
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
              color && subtle[color],
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
