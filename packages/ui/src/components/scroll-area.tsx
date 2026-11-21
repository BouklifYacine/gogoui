import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'

import { cn } from '../lib/cn.ts'

/**
 * A box that scrolls with a discreet bar.
 *
 * **Use it for** a long list inside a fixed height: a menu, a side panel,
 * a chat. **Not for** the page itself.
 *
 * **Key props**: a fixed height on it (`h-72`), `orientation` on
 * `ScrollBar` for a horizontal scroll.
 *
 * **Accessibility**: the content stays reachable with the keyboard and the
 * wheel.
 *
 * @summary A box that scrolls with a discreet bar.
 */
function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-0.5 opacity-0 transition-opacity duration-150 select-none data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[scrolling]:duration-0',
        orientation === 'vertical' ? 'h-full w-2.5' : 'h-2.5 flex-col',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-line-strong"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
