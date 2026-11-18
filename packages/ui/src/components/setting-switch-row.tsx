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
 * A row of a settings list with a switch at its end: the setting applies
 * as soon as it is flipped, nothing to save afterwards. Inside a form
 * saved with a button, use `SwitchField` instead.
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
