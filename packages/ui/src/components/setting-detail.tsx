import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { Button } from './button.tsx'

/** The words SettingDetail writes, to change on one SettingDetail only. */
type SettingDetailLabels = Partial<Pick<GoGoUIMessages, 'edit'>>

type SettingDetailProps = {
  children: ReactNode
  /** The link's full name for a screen reader (« le délai de la relance »). */
  editLabel: string
  onEdit: () => void
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: SettingDetailLabels
}

/**
 * A switched setting's details and their « Modifier ».
 *
 * **Use it for** under a `SettingSwitchRow` that is on (« 3 jours avant »).
 *
 * **Key props**: children, `onEdit`, `editLabel`, `labels` to change its words.
 *
 * @summary A switched setting's details and their « Modifier ».
 */
function SettingDetail({
  children,
  editLabel,
  onEdit,
  labels,
}: SettingDetailProps) {
  const { edit } = useGoGoUIMessages(labels)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="text-fg-muted">{children}</span>
      <Button
        variant="link"
        size="sm"
        className="h-auto px-0 text-sm"
        onClick={onEdit}
      >
        {edit}
        <span className="sr-only"> {editLabel}</span>
      </Button>
    </div>
  )
}

export { SettingDetail }
export type { SettingDetailProps, SettingDetailLabels }
