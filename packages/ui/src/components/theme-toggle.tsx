import { useSyncExternalStore } from 'react'
import { DesktopIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import {
  readTheme,
  subscribeTheme,
  themeScript,
  writeTheme,
} from '../internal/theme-store.ts'
import type { Theme } from '../internal/theme-store.ts'
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx'

/**
 * The theme chosen on this device, and how to change it: `.dark` goes on
 * `<html>`, the device's own setting when « system ».
 */
function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readTheme,
    () => 'system' as const,
  )
  return [theme, writeTheme]
}

type ThemeToggleProps = {
  /** Icons only, their names for screen readers and on hover. */
  compact?: boolean
  className?: string
}

/**
 * Switches between light, dark and the device's theme.
 *
 * **Use it for** the app's header, its user menu or its settings.
 *
 * **Key props**: `compact` (icons only, their names on hover and for screen
 * readers, for a header).
 * Put `themeScript` in the page's head so the right theme shows before
 * React starts.
 *
 * **Accessibility**: each choice is named; the chosen one is pressed.
 *
 * @summary Switch between light, dark and the device's theme.
 */
function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const messages = useGoGoUIMessages()
  const [theme, setTheme] = useTheme()
  const options = [
    { value: 'light', label: messages.themeLight, icon: SunIcon },
    { value: 'dark', label: messages.themeDark, icon: MoonIcon },
    { value: 'system', label: messages.themeSystem, icon: DesktopIcon },
  ] as const

  return (
    <ToggleGroup
      aria-label={messages.theme}
      value={[theme]}
      onValueChange={(next) => {
        const [chosen] = next as Theme[]
        // Pressing the chosen one again keeps it.
        if (chosen) setTheme(chosen)
      }}
      className={className}
    >
      {options.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          aria-label={compact ? label : undefined}
          title={compact ? label : undefined}
        >
          <Icon aria-hidden="true" />
          {!compact && label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { ThemeToggle, themeScript, useTheme }
export type { Theme, ThemeToggleProps }
