import {
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ComponentProps, Ref } from 'react'
import { Group, Panel, Separator, useParentGroup } from 'react-resizable-panels'
import type { PanelImperativeHandle } from 'react-resizable-panels'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { ResizableContext } from '../internal/resizable-context.ts'
import type { ResizablePanelEntry } from '../internal/resizable-context.ts'
import { cn } from '../lib/cn.ts'

/** Gives a node or a handle to a ref the caller passed, whatever its kind. */
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

/**
 * Panels the person resizes by dragging the line between them.
 *
 * **Use it for** an inbox (list | message), an editor and its preview.
 * **Not for** a phone: stack the panels instead.
 *
 * **Where**: a desktop layout with a definite height.
 *
 * **States**: at rest (a 1px line), the line pointed at or focused (its
 * grip forms), dragged, a panel folded (a tab on the line brings it back).
 * A panel folds and reopens on a spring (Arc UI); the drag itself follows
 * the pointer to the pixel. Still under reduced motion.
 *
 * **Key props**: `orientation` (horizontal, vertical); `defaultSize`,
 * `minSize`, `collapsible`, `collapsedSize`, `label` on each
 * `ResizablePanel`; `withHandle` on `ResizableHandle`.
 *
 * **Compose**: `ResizablePanelGroup` > `ResizablePanel` + `ResizableHandle`
 * + `ResizablePanel`.
 *
 * **Accessibility**: the line is a focusable separator; the arrows resize,
 * Home and End go to the limits, Enter folds or reopens a collapsible
 * panel; a folded panel is `inert` and its line says so (« Dossiers
 * masqué, Entrée pour l'afficher »).
 *
 * @summary Panels the person resizes by dragging.
 */
function ResizablePanelGroup({
  className,
  ...props
}: ComponentProps<typeof Group>) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [panels] = useState(() => new Map<string, ResizablePanelEntry>())
  const report = useCallback((id: string, folded: boolean) => {
    setCollapsed((current) => {
      if (current.has(id) === folded) return current
      const next = new Set(current)
      if (folded) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])
  const value = useMemo(
    () => ({ collapsed, report, panels }),
    [collapsed, report, panels],
  )

  return (
    <ResizableContext value={value}>
      <Group
        data-slot="resizable-panel-group"
        className={cn(
          'flex size-full aria-[orientation=vertical]:flex-col',
          // A panel folds and reopens on a spring; never while a line is
          // held, so the drag follows the pointer exactly.
          '*:data-panel:transition-[flex-grow] *:data-panel:duration-(--motion-spring) *:data-panel:ease-spring has-data-[separator=active]:*:data-panel:transition-none',
          className,
        )}
        {...props}
      />
    </ResizableContext>
  )
}

type ResizablePanelProps = ComponentProps<typeof Panel> & {
  /** Its name, said by the line once it is folded (« Afficher Dossiers »). */
  label?: string
}

/**
 * One panel of a `ResizablePanelGroup`. Folded (`collapsible`), its content
 * fades and becomes `inert`.
 *
 * @summary One panel of a resizable group.
 */
function ResizablePanel({
  id,
  label,
  panelRef,
  onResize,
  className,
  ...props
}: ResizablePanelProps) {
  const generated = useId()
  const key = String(id ?? generated)
  const context = useContext(ResizableContext)
  const own = useRef<PanelImperativeHandle | null>(null)
  const folded = context?.collapsed.has(key) ?? false

  const handleRef = useCallback(
    (handle: PanelImperativeHandle | null) => {
      own.current = handle
      assignRef(panelRef, handle)
      if (!context) return
      if (handle) context.panels.set(key, { expand: handle.expand, label })
      else context.panels.delete(key)
    },
    [context, key, label, panelRef],
  )

  return (
    <Panel
      data-slot="resizable-panel"
      data-panel-collapsed={folded || undefined}
      inert={folded || undefined}
      id={key}
      panelRef={handleRef}
      onResize={(size, panelId, previous) => {
        context?.report(key, own.current?.isCollapsed() ?? false)
        onResize?.(size, panelId, previous)
      }}
      className={cn(
        'transition-opacity duration-(--motion-fast) ease-standard in-data-panel-collapsed:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

/** The words ResizableHandle writes, to change on one ResizableHandle only. */
type ResizableHandleLabels = Partial<
  Pick<GoGoUIMessages, 'showPanel' | 'panelHidden'>
>

type ResizableHandleProps = ComponentProps<typeof Separator> & {
  /** A grip that forms in the line's middle when it is pointed at or held. */
  withHandle?: boolean
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: ResizableHandleLabels
}

/**
 * The line between two panels: 1px, with a 12px band to grab. Pointed at,
 * focused or held, its grip forms on a spring (`withHandle`). Once a
 * neighbour is folded, a small tab with a chevron shows on it: a click or
 * Enter brings the panel back.
 *
 * **Key props**: `labels` to change its words.
 *
 * @summary The line between two panels, and the way back to a folded one.
 */
function ResizableHandle({
  withHandle = false,
  className,
  elementRef,
  onClick,
  onKeyDownCapture,
  labels,
  ...props
}: ResizableHandleProps) {
  const context = useContext(ResizableContext)
  const vertical = useParentGroup()?.orientation === 'vertical'
  const { showPanel, panelHidden } = useGoGoUIMessages(labels)
  const [sides, setSides] = useState<{ before?: string; after?: string }>({})

  // The panels on either side are its DOM neighbours (the library keeps
  // them direct children of the group).
  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      assignRef(elementRef, node)
      if (!node) return
      const before = node.previousElementSibling?.id || undefined
      const after = node.nextElementSibling?.id || undefined
      setSides((current) =>
        current.before === before && current.after === after
          ? current
          : { before, after },
      )
    },
    [elementRef],
  )

  const folded =
    sides.before && context?.collapsed.has(sides.before)
      ? 'before'
      : sides.after && context?.collapsed.has(sides.after)
        ? 'after'
        : undefined
  const entry = folded
    ? context?.panels.get((folded === 'before' ? sides.before : sides.after)!)
    : undefined
  // The tab keeps its side while it leaves.
  const [side, setSide] = useState<'before' | 'after'>(folded ?? 'before')
  if (folded && folded !== side) setSide(folded)

  const chevron = vertical
    ? side === 'before'
      ? 'chevronDown'
      : 'chevronUp'
    : side === 'before'
      ? 'chevronRight'
      : 'chevronLeft'

  return (
    <Separator
      data-slot="resizable-handle"
      data-collapsed={folded}
      elementRef={handleRef}
      aria-valuetext={folded ? panelHidden(entry?.label) : undefined}
      title={folded ? showPanel(entry?.label) : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (folded) entry?.expand()
      }}
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event)
        // Enter reopens the folded side, whichever it is (the library would
        // only fold or reopen the panel before the line).
        if (folded && event.key === 'Enter') {
          event.preventDefault()
          entry?.expand()
        }
      }}
      className={cn(
        // A 1 px line with a wider grab area around it.
        'group/handle relative flex w-px items-center justify-center bg-line outline-none transition-colors duration-(--motion-fast) ease-standard after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 data-[separator=active]:bg-line-strong data-[separator=hover]:bg-line-strong focus-visible:bg-line-focus aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:inset-y-auto aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:h-3 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2',
        // Folded: the line steps back behind its tab, and the grab area
        // widens on the tab's side.
        'data-collapsed:cursor-pointer data-collapsed:bg-transparent data-[collapsed=after]:after:right-0 data-[collapsed=after]:after:left-auto data-[collapsed=after]:after:w-8 data-[collapsed=after]:after:translate-x-0 data-[collapsed=before]:after:left-0 data-[collapsed=before]:after:w-8 data-[collapsed=before]:after:translate-x-0',
        className,
      )}
      {...props}
    >
      {withHandle && !folded && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-1/2 rounded-full bg-line-strong opacity-0 [transition-duration:var(--motion-fast),var(--motion-spring),var(--motion-fast)] [transition-property:opacity,scale,background-color] [transition-timing-function:var(--motion-ease-standard),var(--motion-ease-spring),var(--motion-ease-standard)] group-focus-visible/handle:opacity-100 group-data-[separator=active]/handle:bg-fg group-data-[separator=active]/handle:opacity-100 group-data-[separator=hover]/handle:opacity-100',
            vertical
              ? 'h-1 w-8 scale-x-60 group-focus-visible/handle:scale-x-100 group-data-[separator=active]/handle:scale-x-100 group-data-[separator=hover]/handle:scale-x-100'
              : 'h-8 w-1 scale-y-60 group-focus-visible/handle:scale-y-100 group-data-[separator=active]/handle:scale-y-100 group-data-[separator=hover]/handle:scale-y-100',
          )}
        />
      )}
      <span
        aria-hidden="true"
        data-side={side}
        className={cn(
          'absolute z-10 grid place-items-center rounded-full bg-surface text-fg-muted shadow-xs ring-1 ring-line [transition-duration:var(--motion-fast),var(--motion-spring),var(--motion-fast),var(--motion-fast)] [transition-property:opacity,scale,filter,color] [transition-timing-function:var(--motion-ease-enter),var(--motion-ease-spring),var(--motion-ease-enter),var(--motion-ease-standard)] group-hover/handle:text-fg group-focus-visible/handle:text-fg',
          vertical
            ? 'left-1/2 -ml-5 h-[18px] w-10 data-[side=after]:bottom-[5px] data-[side=after]:origin-bottom data-[side=before]:top-[5px] data-[side=before]:origin-top'
            : 'top-1/2 -mt-5 h-10 w-[18px] data-[side=after]:right-[5px] data-[side=after]:origin-right data-[side=before]:left-[5px] data-[side=before]:origin-left',
          folded
            ? 'scale-100 opacity-100 blur-none'
            : 'pointer-events-none scale-60 opacity-0 blur-[2px]',
        )}
      >
        <GoGoIcon name={chevron} className="size-3.5" />
      </span>
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
export type { ResizableHandleProps, ResizablePanelProps, ResizableHandleLabels }
