import type { ReactNode } from 'react'

import { SkeletonText } from './skeleton.tsx'

type PageHeaderSkeletonProps = {
  /** The real title: the grey bar takes its length. */
  title: string
  description?: string
  /** The buttons' skeletons. */
  actions?: ReactNode
}

/**
 * `PageHeader` while the page loads: its title and sentence in grey, as
 * long as the words, its buttons on the right.
 *
 * @summary A page's header while it loads.
 */
function PageHeaderSkeleton({
  title,
  description,
  actions,
}: PageHeaderSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col items-start gap-2">
        <SkeletonText className="text-2xl font-medium tracking-title sm:text-3xl">
          {title}
        </SkeletonText>
        {description && (
          <p>
            <SkeletonText>{description}</SkeletonText>
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  )
}

export { PageHeaderSkeleton }
export type { PageHeaderSkeletonProps }
