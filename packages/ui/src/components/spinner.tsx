import type { ComponentProps } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { text } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'

/**
 * A turning circle while something loads.
 *
 * **Use it for** a short wait of unknown length, inside a button or a
 * small zone. **Prefer** `Skeleton` for a page's first load, `Progress`
 * when the end is known.
 *
 * **Key props**: `color`, size through `className`.
 *
 * **Accessibility**: alone, it says « Chargement »; inside a button the
 * button's `aria-busy` says it.
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
    <GoGoIcon
      role="status"
      aria-label={loading}
      {...props}
      name="loading"
      className={cn('size-3.5 animate-spin', color && text[color], className)}
    />
  )
}

export { Spinner }
