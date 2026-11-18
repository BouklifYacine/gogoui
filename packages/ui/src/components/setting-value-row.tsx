import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { Button } from './button.tsx'

type SettingValueRowProps = {
  title: string
  /** What the setting is for, under its title. */
  description?: string
  /** What is set today, in words (« Aucune », an address, a text). */
  value: ReactNode
  /** Opens the dialog that changes it. */
  onEdit: () => void
  /** The button's word, « Modifier » by default (« Choisir »). */
  editLabel?: string
}

/**
 * A row of a settings list showing a value and a « Modifier » button: the
 * change happens in a `SettingDialog`, with its own « Enregistrer ». The
 * button names its row for a screen reader (« Modifier Signature »).
 *
 * @summary A setting's value and its « Modifier ».
 */
function SettingValueRow({
  title,
  description,
  value,
  onEdit,
  editLabel,
}: SettingValueRowProps) {
  const { edit } = useGoGoUIMessages()
  return (
    <div
      data-slot="setting-value-row"
      className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-base font-medium text-fg">{title}</p>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
        <div className="line-clamp-2 text-base wrap-break-word whitespace-pre-line text-fg-muted">
          {value}
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0" onClick={onEdit}>
        {editLabel ?? edit}
        <span className="sr-only"> {title}</span>
      </Button>
    </div>
  )
}

export { SettingValueRow }
export type { SettingValueRowProps }
