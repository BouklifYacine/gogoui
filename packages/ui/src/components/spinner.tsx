import { CircleNotchIcon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { text } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

/**
 * A turning circle while something loads. Alone, it says « Chargement »
 * (or the provider's word) to a screen reader. Inside a button or beside a
 * text that already says it, pass `aria-hidden`: `Button` does it for you
 * with `loading`.
 *
 * @summary A loading indicator that speaks to screen readers when alone.
 */
function Spinner({
  className,
  color,
  ...props
}: Omit<ComponentProps<'svg'>, 'color'> & {
  /** Its colour; the words around it by default. */
  color?: Color
}) {
  const { loading } = useGoGoUIMessages()
  return (
    <CircleNotchIcon
      role="status"
      aria-label={loading}
      className={cn('size-3.5 animate-spin', color && text[color], className)}
      {...props}
    />
  )
}

export { Spinner }
