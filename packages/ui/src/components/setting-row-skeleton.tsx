import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { Skeleton, SkeletonButton, SkeletonText } from './skeleton.tsx'

/** The words SettingRowSkeleton writes, to change on one SettingRowSkeleton only. */
type SettingRowSkeletonLabels = Partial<Pick<GoGoUIMessages, 'edit'>>

type SettingRowSkeletonProps = {
  title: string
  description?: string
  /** A value row: the value under the title, « Modifier » beside. */
  value?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: SettingRowSkeletonLabels
}

/**
 * A settings row while it loads.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary A settings row while it loads.
 */
function SettingRowSkeleton({
  title,
  description,
  value,
  labels,
}: SettingRowSkeletonProps) {
  const { edit } = useGoGoUIMessages(labels)
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
export type { SettingRowSkeletonProps, SettingRowSkeletonLabels }
