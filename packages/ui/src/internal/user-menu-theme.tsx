import type { CSSProperties, KeyboardEvent } from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'

import { DropdownMenuRadioGroup } from '../components/dropdown-menu.tsx'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { GoGoIcon } from './gogo-icon.tsx'
import type { Theme } from './theme-store.ts'

const ICONS = {
  light: 'themeLight',
  dark: 'themeDark',
  system: 'themeSystem',
} as const

/**
 * UserMenu's theme row, after Arc UI (https://uiarc.dev, MIT): « Thème »
 * and a small segmented switch whose thumb slides under the chosen icon.
 * Radio items of the menu, so choosing keeps it open; up and down reach
 * them like rows, left and right choose within the switch.
 *
 * @summary Internal: the light, dark and system switch of UserMenu.
 */
export function UserMenuTheme({
  theme,
  onThemeChange,
}: {
  theme: Theme
  onThemeChange: (theme: Theme) => void
}) {
  const messages = useGoGoUIMessages()
  const options = [
    { value: 'light', label: messages.themeLight },
    { value: 'dark', label: messages.themeDark },
    { value: 'system', label: messages.themeSystem },
  ] as const
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === theme),
  )

  // Left and right move within the switch and choose, as a segmented
  // control does.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return
    }
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[role="menuitemradio"]',
      ),
    )
    const at = items.findIndex((item) => item === document.activeElement)
    if (at < 0) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const step = event.key === 'ArrowRight' ? 1 : -1
    const next = items[(at + step + items.length) % items.length]
    next?.focus()
    next?.click()
  }

  return (
    <div
      data-slot="user-menu-theme"
      className="flex h-9 items-center gap-2.5 pr-1 pl-2.5 text-sm text-fg max-md:h-12"
    >
      <GoGoIcon
        name={ICONS[theme]}
        aria-hidden="true"
        className="size-4 shrink-0 text-fg-muted"
      />
      <span aria-hidden="true" className="flex-1">
        {messages.theme}
      </span>
      <DropdownMenuRadioGroup
        aria-label={messages.theme}
        value={theme}
        onValueChange={(value) => onThemeChange(value as Theme)}
        onKeyDown={onKeyDown}
        style={{ '--index': index } as CSSProperties}
        className="relative isolate inline-grid h-6.5 auto-cols-[28px] grid-flow-col rounded-[7px] bg-hover p-0.5 max-md:h-8.5 max-md:auto-cols-[40px]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0.5 left-0.5 -z-10 w-7 translate-x-[calc(var(--index)*100%)] rounded-[5px] bg-floating shadow-xs ring-[0.5px] ring-line transition-transform duration-(--motion-spring) ease-spring motion-reduce:transition-none max-md:w-10 dark:bg-selected dark:shadow-none"
        />
        {options.map((option) => (
          <MenuPrimitive.RadioItem
            key={option.value}
            value={option.value}
            closeOnClick={false}
            aria-label={option.label}
            title={option.label}
            // Not a row: the menu's gliding highlight leaves it alone.
            data-slot="user-menu-theme-option"
            className="grid cursor-default place-items-center rounded-[5px] text-fg-muted outline-none transition-colors duration-150 ease-standard select-none hover:text-fg data-checked:text-fg data-highlighted:bg-hover data-highlighted:text-fg motion-reduce:transition-none"
          >
            <GoGoIcon
              name={ICONS[option.value]}
              aria-hidden="true"
              className="size-3.5"
            />
          </MenuPrimitive.RadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  )
}
