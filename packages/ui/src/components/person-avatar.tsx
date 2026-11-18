import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { Color } from '../internal/colors.ts'
import { Avatar, AvatarFallback, AvatarImage } from './avatar.tsx'

type PersonAvatarProps = {
  /** The person's name: its initials show without a photo. */
  name?: string
  /** The photo's address. */
  src?: string
  /** The photo's description, the name by default. */
  alt?: string
  /** Shown instead of the initials (an icon). */
  fallback?: ReactNode
  size?: 'sm' | 'default' | 'lg'
  /** The initials' tint; grey by default. */
  color?: Color
  className?: string
}

/** « Marie Durand » → « MD »; no name → « ? ». */
function initialsOf(name: string | undefined) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0] ?? '')
      .slice(0, 2)
      .join('')
      .toLocaleUpperCase() || '?'
  )
}

/**
 * A person's round photo, or their initials when there is no photo or it
 * fails to load. Built on `Avatar`; use `Avatar` itself for anything that
 * is not a person (a company logo).
 *
 * @summary A person's photo, or their initials without one.
 */
function PersonAvatar({
  name,
  src,
  alt,
  fallback,
  size = 'default',
  color,
  className,
}: PersonAvatarProps) {
  const { profilePhoto } = useGoGoUIMessages()

  return (
    <Avatar size={size} className={className} data-slot="person-avatar">
      {src && <AvatarImage src={src} alt={alt ?? name ?? profilePhoto} />}
      <AvatarFallback color={color}>
        {fallback ?? initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export { PersonAvatar }
export type { PersonAvatarProps }
