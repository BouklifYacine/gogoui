// User menu, after Arc UI (https://uiarc.dev, MIT licence, Elia Kuratli),
// composed on GoGoUI's DropdownMenu.
import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { ButtonLabel } from '../internal/button-label.tsx'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { PresenceDot } from '../internal/presence-dot.tsx'
import type { Presence } from '../internal/presence-dot.tsx'
import { UserMenuHeader } from '../internal/user-menu-header.tsx'
import { UserMenuTheme } from '../internal/user-menu-theme.tsx'
import type { UserMenuThemeLabels } from '../internal/user-menu-theme.tsx'
import type { Theme } from '../internal/theme-store.ts'
import { cn } from '../lib/cn.ts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'
import { PersonAvatar } from './person-avatar.tsx'
import { useTheme } from './theme-toggle.tsx'

type UserMenuUser = {
  name: string
  email: string
  /** The plan or the role, beside the name (« Pro », « Gérante »). */
  plan?: string
  avatarSrc?: string
}

type UserMenuItem = {
  label: string
  /** An icon before the words (any library's). */
  icon?: ReactNode
  /** The shortcut shown at the end of the row (« ⌘, »). */
  shortcut?: string
  /** A page to go to: the row is a link. */
  href?: string
  /** Your router's link instead of `href` (`<Link to="/compte" />`): no full reload. */
  render?: ReactElement
  onSelect?: () => void
  disabled?: boolean
}

/** The words UserMenu writes, to change on one UserMenu only. */
type UserMenuLabels = Partial<
  Pick<
    GoGoUIMessages,
    | 'presenceAvailable'
    | 'presenceBusy'
    | 'presenceAway'
    | 'accountMenu'
    | 'signingOut'
    | 'signOut'
  >
> &
  UserMenuThemeLabels

type UserMenuProps = {
  user: UserMenuUser
  /** The account's pages and tools; three or four. */
  items?: UserMenuItem[]
  /** More rows after `items`: `DropdownMenuItem`s, a `DropdownMenuGroup`… */
  children?: ReactNode
  /** The light, dark and system switch. On by default. */
  showTheme?: boolean
  /** The theme, controlled; GoGoUI's own theme store by default. */
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
  /** Signs out; a promise keeps the menu open, its row turning, until it settles. */
  onSignOut?: () => void | Promise<unknown>
  /** A presence dot on the photo; none by default. */
  status?: Presence
  /** The plan badge's colour; grey by default. */
  planColor?: Color
  /**
   * The name and a chevron beside the photo, from 640px up: under it, a
   * top bar has no room left for them.
   */
  showName?: boolean
  /**
   * Under 768px, the menu rises from the bottom edge as a sheet. On by
   * default; `false` keeps the floating menu on a phone too.
   */
  phoneSheet?: boolean
  size?: 'sm' | 'default'
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** On the trigger. */
  className?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: UserMenuLabels
}

/**
 * The account menu behind a person's photo: who is signed in, the
 * account's pages, the theme, and signing out.
 *
 * **Use it for** the signed-in person's own account, in an app's top bar
 * or at the foot of its sidebar. **Not for** actions on someone else
 * (`DropdownMenu`), or navigation between the app's sections (`Sidebar`).
 *
 * **Where**: the top bar's right end (`align="end"`), or the sidebar's
 * foot (`side="top"`, `showName`). On a phone (under 768px) the menu rises
 * from the screen's bottom edge, full width over a veil, within the
 * thumb's reach; under 640px the trigger keeps the photo alone.
 *
 * **States**: closed, open, signing out (the row turns and says it, the
 * menu waits), with or without a presence dot.
 *
 * **Compose**: built on `DropdownMenu`: its gliding highlight, its
 * entrance, its rows. Extra rows go in `children` as `DropdownMenuItem`s.
 *
 * **Key props**: `user` (`name`, `email`, `plan`, `avatarSrc`), `items`
 * (`label`, `icon`, `shortcut`, `href`, `render` or `onSelect`),
 * `onSignOut`, `showTheme`, `theme` + `onThemeChange`, `status`,
 * `showName`, `phoneSheet`, `size`, `align`, `side`,
 * `labels` to change its words.
 *
 * **Accessibility**: the trigger is named « Menu du compte, {nom} »; arrows
 * move through the rows and the theme's choices, left and right choose a
 * theme, Escape closes and gives the focus back. The presence dot has a
 * shape as well as a colour, and is said in the trigger's name.
 *
 * @summary The signed-in person's account menu.
 */
function UserMenu({
  user,
  items = [],
  children,
  showTheme = true,
  theme: themeProp,
  onThemeChange,
  onSignOut,
  status,
  planColor,
  showName = false,
  phoneSheet = true,
  size = 'default',
  align = 'end',
  side = 'bottom',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  labels,
}: UserMenuProps) {
  const messages = useGoGoUIMessages(labels)
  const [storedTheme, storeTheme] = useTheme()
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const [signingOut, setSigningOut] = useState(false)
  const open = openProp ?? innerOpen
  const theme = themeProp ?? storedTheme

  const setOpen = (next: boolean) => {
    setInnerOpen(next)
    onOpenChange?.(next)
  }

  const changeTheme = (next: Theme) => {
    if (themeProp === undefined) {
      storeTheme(next)
    }
    onThemeChange?.(next)
  }

  const signOut = () => {
    if (signingOut) {
      return
    }
    const result = onSignOut?.()
    if (!(result instanceof Promise)) {
      setOpen(false)
      return
    }
    // The menu stays open, the row turning, until it settles.
    setSigningOut(true)
    const settle = () => {
      setSigningOut(false)
      setOpen(false)
    }
    result.then(settle, settle)
  }

  const presence =
    status &&
    {
      available: messages.presenceAvailable,
      busy: messages.presenceBusy,
      away: messages.presenceAway,
    }[status]

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        // While signing out, the menu waits for the answer.
        if (!next && signingOut) {
          return
        }
        setOpen(next)
      }}
    >
      <DropdownMenuTrigger
        data-size={size}
        className={cn(
          // It opens a menu, so it answers with colour, never with scale.
          'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full text-sm text-fg outline-none transition-colors duration-150 ease-standard select-none [-webkit-tap-highlight-color:transparent] hover:bg-hover active:bg-selected data-popup-open:bg-hover motion-reduce:transition-none',
          'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus',
          size === 'sm' ? 'h-8 p-1' : 'h-10 p-1',
          showName && 'pr-2.5 max-sm:pr-1',
          className,
        )}
      >
        {/* Named by its words, not an aria-label: the initials and the name
            on screen are drawn for the eye, so the name holds what is seen
            (WCAG 2.5.3) even when the name is hidden on a phone. */}
        <span className="sr-only">
          {presence
            ? `${messages.accountMenu(user.name)}, ${presence}`
            : messages.accountMenu(user.name)}
        </span>
        <span aria-hidden="true" className="relative inline-flex shrink-0">
          <PersonAvatar
            name={user.name}
            src={user.avatarSrc}
            alt=""
            size={size === 'sm' ? 'sm' : 'default'}
          />
          {status && (
            <PresenceDot
              status={status}
              className="absolute -right-px -bottom-px ring-surface"
            />
          )}
        </span>
        {showName && (
          <>
            <span
              aria-hidden="true"
              className="max-w-44 truncate leading-none font-medium max-sm:hidden"
            >
              {user.name}
            </span>
            <span
              data-icon="inline-end"
              aria-hidden="true"
              className="contents"
            >
              <GoGoIcon
                name="chevronDown"
                aria-hidden="true"
                // At the far end when the trigger is wider than its words
                // (a sidebar's foot), right after them otherwise.
                className="ml-auto size-4 text-fg-muted max-sm:hidden"
              />
            </span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={8}
        phoneSheet={phoneSheet}
        className="w-62 max-w-[calc(100vw-24px)] min-w-0"
      >
        <UserMenuHeader
          name={user.name}
          email={user.email}
          plan={user.plan}
          planColor={planColor}
          avatarSrc={user.avatarSrc}
          status={status}
        />
        {items.length > 0 && <DropdownMenuSeparator />}
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            onClick={item.onSelect}
            render={
              item.render ?? (item.href ? <a href={item.href} /> : undefined)
            }
          >
            {item.icon}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.shortcut && (
              <DropdownMenuShortcut className="max-md:hidden">
                {item.shortcut}
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
        {children}
        {showTheme && (
          <>
            <DropdownMenuSeparator />
            <UserMenuTheme
              theme={theme}
              onThemeChange={changeTheme}
              labels={labels}
            />
          </>
        )}
        {onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              closeOnClick={false}
              aria-busy={signingOut || undefined}
              onClick={signOut}
            >
              <GoGoIcon
                name={signingOut ? 'loading' : 'signOut'}
                aria-hidden="true"
                className={cn(
                  signingOut &&
                    'animate-spin [animation-duration:800ms] motion-reduce:[animation-duration:2.4s]',
                )}
              />
              <ButtonLabel>
                {signingOut ? messages.signingOut : messages.signOut}
              </ButtonLabel>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
export type { UserMenuItem, UserMenuProps, UserMenuUser, UserMenuLabels }
