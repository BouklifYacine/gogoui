import { Group, Panel, Separator } from 'react-resizable-panels'
import type { ComponentProps } from 'react'

import { cn } from '../lib/cn.ts'

/**
 * Panels the person resizes by dragging the line between them.
 *
 * **Use it for** an inbox (list | message), an editor and its preview.
 * **Not for** a phone: stack the panels instead.
 *
 * **Key props**: `orientation` (horizontal, vertical); `defaultSize`,
 * `minSize` on each `ResizablePanel`; `withHandle` on `ResizableHandle`.
 *
 * **Compose**: `ResizablePanelGroup` > `ResizablePanel` + `ResizableHandle`
 * + `ResizablePanel`.
 *
 * **Accessibility**: the handle is focusable; arrows resize.
 *
 * @summary Panels the person resizes by dragging.
 */
function ResizablePanelGroup({
  className,
  ...props
}: ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        'flex size-full aria-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle = false,
  className,
  ...props
}: ComponentProps<typeof Separator> & {
  /** A visible grip in the line's middle. */
  withHandle?: boolean
}) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        // A 1 px line with a wider grab area around it.
        'relative flex w-px items-center justify-center bg-line outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 hover:bg-line-strong focus-visible:bg-line-focus aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:inset-y-auto aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:h-3 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <span
          aria-hidden="true"
          className="z-10 flex h-6 w-1.5 shrink-0 rounded-full bg-line-strong"
        />
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
