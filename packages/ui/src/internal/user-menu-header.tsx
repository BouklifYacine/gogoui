import { Badge } from '../components/badge.tsx'
import { PersonAvatar } from '../components/person-avatar.tsx'
import { cn } from '../lib/cn.ts'
import type { Color } from './colors.ts'
import { PresenceDot } from './presence-dot.tsx'
import type { Presence } from './presence-dot.tsx'

/**
 * The identity at the top of UserMenu, after Arc UI (https://uiarc.dev,
 * MIT): photo or initials, the name with its plan, the e-mail cut short. A
 * long plan shrinks before the name does.
 *
 * @summary Internal: UserMenu's identity header.
 */
export function UserMenuHeader({
  name,
  email,
  plan,
  planColor,
  avatarSrc,
  status,
}: {
  name: string
  email: string
  plan?: string
  planColor?: Color
  avatarSrc?: string
  status?: Presence
}) {
  return (
    <div
      data-slot="user-menu-header"
      className="flex items-center gap-2.5 p-2 max-md:pb-3"
    >
      <span className="relative inline-flex shrink-0">
        <PersonAvatar name={name} src={avatarSrc} alt="" />
        {status && (
          <PresenceDot
            status={status}
            className="absolute -right-px -bottom-px ring-floating"
          />
        )}
      </span>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 shrink truncate text-[13px] leading-tight font-medium text-fg">
            {name}
          </span>
          {plan && (
            <Badge
              variant="outline"
              color={planColor}
              className={cn(
                'h-4.5 max-w-[55%] min-w-0 shrink-[100] truncate rounded-sm px-1.5 text-[11px]',
                !planColor && 'text-fg-muted',
              )}
            >
              {plan}
            </Badge>
          )}
        </div>
        <span
          className="truncate text-xs leading-tight text-fg-muted"
          title={email}
        >
          {email}
        </span>
      </div>
    </div>
  )
}
