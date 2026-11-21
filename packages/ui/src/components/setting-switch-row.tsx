import type { ReactNode } from 'react'

import { ErrorAlert } from './error-alert.tsx'
import { Label } from './label.tsx'
import { Switch } from './switch.tsx'

type SettingSwitchRowProps = {
  /** The switch's id; its label and help take theirs from it. */
  id: string
  title: string
  description?: string
  checked: boolean
  /** While the change is saved: the switch waits. */
  saving?: boolean
  onCheckedChange: (checked: boolean) => void
  /** Why the last change was refused, shown in the row. */
  error?: string | null
  /** Under the help: the setting's details and their « Modifier ». */
  children?: ReactNode
}

/**
 * A setting that applies as soon as it is switched.
 *
 * **Use it for** « Rappels par e-mail », « Accepter les visites le
 * dimanche ».
 *
 * **States**: off, on, saving (spinner), refused (`error` under it, the
 * switch back), with details shown when on (children, `SettingDetail`).
 *
 * **Key props**: `title`, `description`, `checked` + `onCheckedChange`,
 * `saving`, `error`, children.
 *
 * **Accessibility**: the switch is named by the title and described by the
 * sentence.
 *
 * @summary A setting that applies when switched.
 */
function SettingSwitchRow({
  id,
  title,
  description,
  checked,
  saving = false,
  onCheckedChange,
  error,
  children,
}: SettingSwitchRowProps) {
  return (
    <div
      data-slot="setting-switch-row"
      className="flex flex-col gap-3 px-4 py-4 sm:px-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor={id} className="text-base font-medium">
            {title}
          </Label>
          {description && (
            <p id={`${id}-description`} className="text-sm text-fg-muted">
              {description}
            </p>
          )}
          {children}
        </div>
        <Switch
          id={id}
          checked={checked}
          disabled={saving}
          onCheckedChange={onCheckedChange}
          aria-describedby={description ? `${id}-description` : undefined}
          className="mt-0.5"
        />
      </div>
      {error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  )
}

export { SettingSwitchRow }
export type { SettingSwitchRowProps }
