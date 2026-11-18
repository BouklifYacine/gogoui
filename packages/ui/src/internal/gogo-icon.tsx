import type { SVGProps } from 'react'

import type { GoGoUIIcons } from '../i18n/icons.ts'
import { useGoGoUIIcons } from '../i18n/icons-context.ts'

type GoGoIconProps = Omit<SVGProps<SVGSVGElement>, 'ref' | 'name'> & {
  /** Which of GoGoUI's icons. */
  name: keyof GoGoUIIcons
  /** Phosphor's weight; other libraries ignore it. */
  weight?: string
}

/** One of GoGoUI's icons, the one GoGoUIProvider set, Phosphor's by default. */
export function GoGoIcon({ name, ...props }: GoGoIconProps) {
  const Icon = useGoGoUIIcons()[name]
  return <Icon {...(props as object)} />
}
