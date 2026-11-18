import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'

type SettingsListProps = {
  children: ReactNode
  className?: string
}

/**
 * The card holding the rows of a settings page (`SettingSwitchRow`,
 * `SettingValueRow`), one under the other with a line between them.
 *
 * @summary The card of a settings page's rows.
 */
function SettingsList({ children, className }: SettingsListProps) {
  return (
    <div
      data-slot="settings-list"
      className={cn(
        'divide-y divide-line rounded-xl border border-line bg-card shadow-xs',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { SettingsList }
export type { SettingsListProps }
