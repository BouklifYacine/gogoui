import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'

import { cn } from '../lib/cn.ts'

/**
 * A card that shows a preview when a link or a name is pointed at (a
 * client's details behind their name). Never the only way to the
 * information: the link leads to it too, and a phone has no hover.
 * Compose it: `HoverCard` > `HoverCardTrigger` + `HoverCardContent`.
 *
 * @summary A preview card when pointing at a link.
 */
function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: PreviewCardPrimitive.Trigger.Props) {
  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'center',
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<
    PreviewCardPrimitive.Positioner.Props,
    'side' | 'sideOffset' | 'align'
  >) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="isolate z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            'z-50 w-72 origin-(--transform-origin) rounded-2xl bg-floating p-4 text-sm text-fg shadow-menu outline-none duration-150 ease-tactile data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
