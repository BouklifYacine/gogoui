import { useCallback } from 'react'
import type { CSSProperties } from 'react'
import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'

import { cn } from '../lib/cn.ts'

/*
 * Each edge fades out only while there is content past it, and by as much
 * as is left, up to `fade` px (Arc UI, https://uiarc.dev, MIT): Base UI
 * writes the distance to each edge on the viewport, so the mask is pure
 * CSS and scrolling never re-renders React.
 */
const edge = (axis: 'x' | 'y', side: 'start' | 'end') =>
  `min(var(--scroll-area-fade), var(--scroll-area-overflow-${axis}-${side}, 0px))`
const fadeMask = [
  `linear-gradient(to bottom, transparent, #000 ${edge('y', 'start')}, #000 calc(100% - ${edge('y', 'end')}), transparent)`,
  `linear-gradient(to right, transparent, #000 ${edge('x', 'start')}, #000 calc(100% - ${edge('x', 'end')}), transparent)`,
].join(', ')

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  /** How long each edge's fade grows, in px; 0 turns the fades off. */
  fade?: number
  /**
   * The mouse wheel scrolls a strip that only scrolls sideways (a row of
   * cards), and lets the page scroll again once the strip reaches an end.
   */
  wheelToHorizontal?: boolean
}

/**
 * A box that scrolls with a discreet bar.
 *
 * **Use it for** a long list inside a fixed height: a menu, a side panel,
 * a chat, a row of cards. **Not for** the page itself.
 *
 * **Where**: around content that may overflow a fixed height or width.
 *
 * **States**: at rest (no bar), hovered or scrolling (the bar shows at
 * once and leaves slowly), the bar thickens from 5 to 7px under the pointer
 * and while dragged; each edge fades while there is more past it.
 *
 * **Key props**: a fixed height on it (`h-72`), `fade` (28px, 0 for none),
 * `wheelToHorizontal` (true), `aria-label` (makes it a named region),
 * `orientation` on `ScrollBar`.
 *
 * **Accessibility**: the viewport takes the keyboard's focus and scrolls
 * with the arrows; given an `aria-label`, it is a region of that name.
 *
 * @summary A box that scrolls with a discreet bar and soft edges.
 */
function ScrollArea({
  className,
  children,
  fade = 28,
  wheelToHorizontal = true,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ScrollAreaProps) {
  // A callback ref with its cleanup: the wheel must be heard non-passive
  // to turn it sideways, which React's onWheel cannot do.
  const wheelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !wheelToHorizontal) return
      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
          return
        // A box that scrolls down keeps its wheel.
        if (node.scrollHeight - node.clientHeight > 0.5) return
        const max = node.scrollWidth - node.clientWidth
        const at = Math.abs(node.scrollLeft)
        if (
          max <= 0 ||
          (event.deltaY < 0 && at <= 0) ||
          (event.deltaY > 0 && at >= max - 0.5)
        )
          return
        event.preventDefault()
        const rtl = getComputedStyle(node).direction === 'rtl'
        node.scrollLeft += event.deltaY * (rtl ? -1 : 1)
      }
      node.addEventListener('wheel', onWheel, { passive: false })
      return () => node.removeEventListener('wheel', onWheel)
    },
    [wheelToHorizontal],
  )
  const named = ariaLabel !== undefined || ariaLabelledBy !== undefined

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={wheelRef}
        data-slot="scroll-area-viewport"
        role={named ? 'region' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="size-full rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus"
        style={
          fade > 0
            ? ({
                '--scroll-area-fade': `${fade}px`,
                maskImage: fadeMask,
                WebkitMaskImage: fadeMask,
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in',
              } as CSSProperties)
            : undefined
        }
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

/**
 * The bar of a `ScrollArea`: an 11px band to grab, a 5px thumb that
 * thickens to 7px under the pointer and while dragged. It shows in 150ms
 * when the area is pointed at or scrolled, and leaves over 360ms.
 *
 * @summary A scroll area's bar; ScrollArea draws both.
 */
function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  const vertical = orientation === 'vertical'
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'group/scrollbar z-1 flex touch-none opacity-0 transition-opacity duration-(--motion-considered) ease-standard select-none data-hovering:opacity-100 data-hovering:duration-(--motion-fast) data-scrolling:opacity-100 data-scrolling:duration-(--motion-fast)',
        vertical ? 'h-full w-[11px] py-[3px]' : 'h-[11px] flex-col px-[3px]',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn(
          'relative after:absolute after:rounded-full after:bg-line-strong after:duration-(--motion-fast) after:ease-standard group-hover/scrollbar:after:bg-fg-subtle active:after:bg-fg-subtle',
          vertical
            ? 'w-full after:inset-y-0 after:right-[3px] after:w-[5px] after:transition-[width,right,background-color] group-hover/scrollbar:after:right-[2px] group-hover/scrollbar:after:w-[7px] active:after:right-[2px] active:after:w-[7px]'
            : 'h-full after:inset-x-0 after:bottom-[3px] after:h-[5px] after:transition-[height,bottom,background-color] group-hover/scrollbar:after:bottom-[2px] group-hover/scrollbar:after:h-[7px] active:after:bottom-[2px] active:after:h-[7px]',
        )}
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
export type { ScrollAreaProps }
