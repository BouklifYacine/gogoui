import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'
import { SkeletonText } from './skeleton.tsx'

type PageHeaderSkeletonProps = {
  /** The real title: the grey bar takes its length. */
  title: string
  description?: string
  /** The buttons' skeletons. */
  actions?: ReactNode
  /** As on PageHeader: false leaves the sentence out under 768px. */
  descriptionOnPhone?: boolean
}

/**
 * A page's header while it loads, at the same size.
 *
 * @summary A page's header while it loads.
 */
function PageHeaderSkeleton({
  title,
  description,
  actions,
  descriptionOnPhone = true,
}: PageHeaderSkeletonProps) {
  return (
    <div className="flex gap-4 max-sm:flex-wrap max-sm:items-center max-sm:justify-between sm:items-start sm:justify-between">
      <div className="flex flex-col items-start gap-2">
        <SkeletonText className="text-2xl font-medium tracking-title sm:text-3xl">
          {title}
        </SkeletonText>
        {description && (
          <p className={cn(!descriptionOnPhone && 'max-md:hidden')}>
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
