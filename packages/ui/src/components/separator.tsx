import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import { cn } from '../lib/cn.ts'

/**
 * A hairline between two zones.
 *
 * **Use it for** splitting groups in a menu, a card or a toolbar. Prefer
 * space first; a line only when space is not enough.
 *
 * **Key props**: `orientation` (horizontal, vertical).
 *
 * **Accessibility**: decorative by default.
 *
 * @summary A hairline between two zones.
 */
function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
