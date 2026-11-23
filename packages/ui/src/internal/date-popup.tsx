import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'

import { cn } from '../lib/cn.ts'

/**
 * The panel of DateField and DateRangePicker, after Arc UI's date picker
 * (https://uiarc.dev, MIT): it grows out of its button (8px towards it,
 * from .95, on a spring that never overshoots, the opacity quick) and
 * leaves quicker than it came. On opening, the focus goes to the day that
 * holds the calendar's tab stop, so the arrows work at once; on closing it
 * goes back to the button (Base UI).
 *
 * @summary Internal: the popover of the date pickers, with Arc UI's motion.
 */
export function DatePopup({
  align = 'start',
  className,
  children,
}: {
  align?: 'start' | 'center' | 'end'
  className?: string
  children: ReactNode
}) {
  const popup = useRef<HTMLDivElement>(null)
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        side="bottom"
        sideOffset={8}
        collisionPadding={8}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          ref={popup}
          data-slot="date-popup"
          initialFocus={() =>
            popup.current?.querySelector<HTMLElement>(
              "[data-slot='calendar'] button[tabindex='0']",
            ) ?? true
          }
          className={cn(
            'origin-(--transform-origin) overflow-hidden rounded-3xl bg-floating text-sm text-fg shadow-lg outline-none',
            '[transition:opacity_var(--motion-fast)_var(--motion-ease-enter),translate_var(--motion-spring)_var(--motion-ease-spring),scale_var(--motion-spring)_var(--motion-ease-spring)]',
            'data-starting-style:-translate-y-2 data-starting-style:scale-95 data-starting-style:opacity-0',
            'data-[side=top]:data-starting-style:translate-y-2',
            'data-ending-style:-translate-y-1.5 data-ending-style:scale-97 data-ending-style:opacity-0 data-ending-style:[transition:opacity_var(--motion-fast)_var(--motion-ease-standard),translate_var(--motion-fast)_var(--motion-ease-standard),scale_var(--motion-fast)_var(--motion-ease-standard)]',
            'data-[side=top]:data-ending-style:translate-y-1.5',
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}
