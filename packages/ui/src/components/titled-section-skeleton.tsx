import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'
import { SkeletonText } from './skeleton.tsx'

type TitledSectionSkeletonProps = {
  title: string
  aside?: ReactNode
  compact?: boolean
  className?: string
  children: ReactNode
}

/**
 * `TitledSection` while its page loads: its title in grey, then its
 * content's skeletons.
 *
 * @summary A titled part of a page while it loads.
 */
function TitledSectionSkeleton({
  title,
  aside,
  compact = false,
  className,
  children,
}: TitledSectionSkeletonProps) {
  const heading = (
    <SkeletonText
      className={cn('w-fit font-medium', compact ? 'text-base' : 'text-xl')}
    >
      {title}
    </SkeletonText>
  )
  return (
    <section
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

export { TitledSectionSkeleton }
export type { TitledSectionSkeletonProps }
