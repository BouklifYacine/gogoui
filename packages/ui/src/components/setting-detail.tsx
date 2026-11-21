import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { Button } from './button.tsx'

type SettingDetailProps = {
  children: ReactNode
  /** The link's full name for a screen reader (« le délai de la relance »). */
  editLabel: string
  onEdit: () => void
}

/**
 * A switched setting's details and their « Modifier ».
 *
 * **Use it for** under a `SettingSwitchRow` that is on (« 3 jours avant »).
 *
 * **Key props**: children, `onEdit`, `editLabel`.
 *
 * @summary A switched setting's details and their « Modifier ».
 */
function SettingDetail({ children, editLabel, onEdit }: SettingDetailProps) {
  const { edit } = useGoGoUIMessages()
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
export type { SettingDetailProps }
