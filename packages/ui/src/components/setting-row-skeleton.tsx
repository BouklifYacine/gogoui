import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { Skeleton, SkeletonButton, SkeletonText } from './skeleton.tsx'

type SettingRowSkeletonProps = {
  title: string
  description?: string
  /** A value row: the value under the title, « Modifier » beside. */
  value?: string
}

/**
 * A settings row while it loads.
 *
 * @summary A settings row while it loads.
 */
function SettingRowSkeleton({
  title,
  description,
  value,
}: SettingRowSkeletonProps) {
  const { edit } = useGoGoUIMessages()
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
      <div className="flex min-w-0 flex-col items-start gap-1">
        <SkeletonText className="font-medium">{title}</SkeletonText>
        {description && (
          <SkeletonText className="text-sm">{description}</SkeletonText>
        )}
        {value && (
          <SkeletonText className="whitespace-pre-line">{value}</SkeletonText>
        )}
      </div>
      {value ? (
        <SkeletonButton size="sm" className="shrink-0">
          {edit}
        </SkeletonButton>
      ) : (
        <Skeleton className="mt-0.5 h-6 w-10 shrink-0 rounded-full" />
      )}
    </div>
  )
}

export { SettingRowSkeleton }
export type { SettingRowSkeletonProps }
