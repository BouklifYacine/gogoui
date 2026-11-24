import { useSyncExternalStore } from 'react'
import { DesktopIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import {
  readTheme,
  subscribeTheme,
  themeScript,
  writeTheme,
} from '../internal/theme-store.ts'
import type { Theme } from '../internal/theme-store.ts'
import { ThemeButton } from '../internal/theme-button.tsx'
import type { ThemeButtonLabels } from '../internal/theme-button.tsx'
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

/** The words ThemeToggle writes, to change on one ThemeToggle only. */
type ThemeToggleLabels = Partial<
  Pick<GoGoUIMessages, 'themeLight' | 'themeDark' | 'themeSystem' | 'theme'>
> &
  ThemeButtonLabels

type ThemeToggleProps = {
  /**
   * `group`: light, dark and the device's, side by side. `button`: one
   * button between light and dark whose icon turns (in « system », it
   * switches from what the device shows).
   */
  variant?: 'group' | 'button'
  /** Icons only, their names for screen readers and on hover. */
  compact?: boolean
  /** `button` only: Button's sizes. */
  size?: 'sm' | 'default' | 'lg'
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ThemeToggleLabels
}

/**
 * Switches between light, dark and the device's theme.
 *
 * **Use it for** the app's header, its user menu or its settings.
 *
 * **Where**: `group` in settings, where the device's choice matters;
 * `button` (compact) in a header, where one click should do.
 *
 * **States**: `group`: the chosen one pressed. `button`: pressed in dark
 * mode; its sun and moon trade places with a turn (not on the first
 * paint, so a stored theme never spins it).
 *
 * **Key props**: `variant` (group, button), `compact` (icons only, their
 * names on hover and for screen readers, for a header), `size` (button).
 * Put `themeScript` in the page's head so the right theme shows before
 * React starts, `labels` to change its words.
 *
 * **Accessibility**: `group`: each choice is named, the chosen one is
 * pressed. `button`: named « Mode sombre » and pressed in dark mode
 * (`aria-pressed`), so its name never changes under the focus.
 *
 * @summary Switch between light, dark and the device's theme.
 */
function ThemeToggle({
  variant = 'group',
  compact = false,
  size = 'default',
  className,
  labels,
}: ThemeToggleProps) {
  const messages = useGoGoUIMessages(labels)
  const [theme, setTheme] = useTheme()
  if (variant === 'button') {
    return (
      <ThemeButton
        compact={compact}
        size={size}
        className={className}
        labels={labels}
      />
    )
  }
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
export type { Theme, ThemeToggleProps, ThemeToggleLabels }
