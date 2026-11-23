import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from 'react'

import { ExpandingButtonGroupContext } from '../internal/expanding-button-group-context.ts'
import type { ExpandingAction } from '../internal/expanding-button-group-context.ts'
import { MotionScope } from '../internal/motion-scope.tsx'
import { useIsMobile } from '../internal/use-is-mobile.ts'
import { cn } from '../lib/cn.ts'

// The buttons' geometry: the icon keeps the same inset closed and open, so
// it never moves while the label shows. On a phone every button is 44px.
const metrics = {
  sm: { height: 28, icon: 14, gap: 5, end: 11 },
  default: { height: 36, icon: 16, gap: 7, end: 14 },
} as const

// How far into a neighbour the pointer must go before it takes the label.
const HYSTERESIS = 4

const ITEM = '[data-slot=expanding-button-group-item]'

type Action = { value: string; disabled?: boolean }

/** The items' values, in order, from the children and their fragments. */
function actionsIn(children: ReactNode): Action[] {
  return Children.toArray(children).flatMap((child): Action[] => {
    if (
      !isValidElement<{
        value?: unknown
        disabled?: boolean
        children?: ReactNode
      }>(child)
    ) {
      return []
    }
    if (child.type === Fragment) {
      return actionsIn(child.props.children)
    }
    return typeof child.props.value === 'string'
      ? [{ value: child.props.value, disabled: child.props.disabled }]
      : []
  })
}

type ExpandingButtonGroupProps = {
  /** What the actions share, for screen readers (« Actions du message »). */
  'aria-label': string
  /** `ExpandingButtonGroupItem`s, as children or inside fragments. */
  children: ReactNode
  size?: 'sm' | 'default'
  /**
   * The action showing its label at rest, the first enabled one by
   * default. Pointing at or focusing another moves the label there; it
   * comes back once the pointer and the focus have left.
   */
  defaultValue?: string
  /** Told each action's value when it runs, before its own `onClick`. */
  onAction?: (value: string) => void
  /** How long a confirmation (tick and « Archivé ») stays, in ms. */
  confirmDuration?: number
  className?: string
  style?: CSSProperties
}

/**
 * A bar of icon buttons where one shows its label, after Arc UI
 * (https://uiarc.dev, MIT).
 *
 * **Use it for** 3 to 6 actions on one subject where room is short (a
 * message, a row, a photo): archive, reply, share, delete. **Not for** a
 * choice that stays (`ToggleGroup`), nor actions that need their words
 * read at a glance (a `ButtonGroup`).
 *
 * **Where**: a card's or a row's corner, a floating bar over a selection.
 *
 * **States**: one action open at rest (its label shown), another opening
 * under the pointer or the keyboard while its neighbours slide aside;
 * busy (the icon pulses while its promise runs); done (a drawn tick, the
 * word in the past tense, a green tint, `confirmDuration`); disabled
 * (dim, still focusable, still shows its label).
 *
 * **Compose**: `ExpandingButtonGroup` > `ExpandingButtonGroupItem`s
 * (`value`, `icon`, children = the label, `doneLabel`, `color`,
 * `onClick`).
 *
 * **Key props**: `aria-label`, `size` (sm, default), `defaultValue`,
 * `onAction`, `confirmDuration`.
 *
 * **Accessibility**: `role="toolbar"`, one Tab stop, the arrows, Home and
 * End move between actions; each keeps its name whatever shows; the past
 * tense word is read by a live region. On touch, a first tap shows the
 * label, a second runs it. 44 px under a thumb on a phone.
 *
 * @summary A bar of icon buttons where one shows its label.
 */
function ExpandingButtonGroup({
  'aria-label': label,
  children,
  size = 'default',
  defaultValue,
  onAction,
  confirmDuration = 1400,
  className,
  style,
}: ExpandingButtonGroupProps) {
  const mobile = useIsMobile()
  const root = useRef<HTMLDivElement>(null)
  const [intent, setIntent] = useState<string | null>(null)
  const [done, setDone] = useState<{ value: string; run: number } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  // What the pointer and the keyboard are doing now, for the leave and
  // blur handlers to fall back on.
  const pointerOver = useRef<string | null>(null)
  const pointerAt = useRef<{ x: number; y: number } | null>(null)
  const keyFocus = useRef<string | null>(null)
  const touchOpen = useRef<string | null>(null)
  const press = useRef<{
    value: string
    kind: string
    wasExpanded: boolean
  } | null>(null)
  const doneValue = useRef<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const mounted = useRef(false)
  const run = useRef(0)

  // The actions, read from the children (fragments opened).
  const actions = actionsIn(children)
  const has = (value: string | null) =>
    value !== null && actions.some((action) => action.value === value)
  const firstEnabled =
    actions.find((action) => !action.disabled)?.value ??
    actions[0]?.value ??
    null
  const restValue =
    defaultValue !== undefined && has(defaultValue)
      ? defaultValue
      : firstEnabled
  const expanded = has(intent) ? intent : restValue
  const tabStop = has(focused) ? focused : restValue

  // A callback ref: with the group it starts listening for a tap outside
  // (which closes a label opened by a first tap), and with it it stops.
  const attach = useCallback((node: HTMLDivElement | null) => {
    root.current = node
    if (!node) {
      return undefined
    }
    mounted.current = true
    function onDown(event: globalThis.PointerEvent) {
      if (!touchOpen.current || node?.contains(event.target as Node)) {
        return
      }
      touchOpen.current = null
      setIntent(doneValue.current ?? keyFocus.current)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
      document.removeEventListener('pointerdown', onDown, true)
    }
  }, [])

  function confirm(action: ExpandingAction) {
    clearTimeout(timer.current)
    run.current += 1
    doneValue.current = action.value
    setDone({ value: action.value, run: run.current })
    // A zero-width space every other time, so the same word is read again.
    setAnnouncement(`${action.doneLabel}${run.current % 2 ? '' : '\u200B'}`)
    timer.current = setTimeout(() => {
      doneValue.current = null
      setDone(null)
      // It closes unless the pointer or the keyboard is still on it.
      if (
        pointerOver.current !== action.value &&
        keyFocus.current !== action.value
      ) {
        if (touchOpen.current === action.value) touchOpen.current = null
        setIntent((current) =>
          current === action.value
            ? (pointerOver.current ?? keyFocus.current)
            : current,
        )
      }
    }, confirmDuration)
  }

  async function activate(action: ExpandingAction) {
    if (
      action.disabled ||
      busy === action.value ||
      doneValue.current === action.value
    ) {
      return
    }
    setIntent(action.value)
    onAction?.(action.value)
    let result: void | boolean
    try {
      const pending = action.onClick?.()
      if (pending instanceof Promise) {
        setBusy(action.value)
        result = await pending
      } else {
        result = pending
      }
    } catch {
      result = false
    } finally {
      if (mounted.current) {
        setBusy((current) => (current === action.value ? null : current))
      }
    }
    if (!mounted.current || result === false || !action.doneLabel) {
      return
    }
    confirm(action)
  }

  function onItemPointerDown(
    value: string,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    press.current = {
      value,
      kind: event.pointerType,
      wasExpanded: expanded === value,
    }
  }

  function onItemClick(action: ExpandingAction) {
    const last = press.current
    press.current = null
    // Touch has no hover: a first tap shows the label, a second runs it.
    if (
      last &&
      last.value === action.value &&
      last.kind === 'touch' &&
      !last.wasExpanded
    ) {
      touchOpen.current = action.value
      setIntent(action.value)
      return
    }
    if (last?.kind === 'touch') touchOpen.current = action.value
    void activate(action)
  }

  function onItemFocus(value: string, event: FocusEvent<HTMLButtonElement>) {
    setFocused(value)
    // The keyboard's focus only: a click or a tap has its own way, and
    // would otherwise leave the label open.
    let visible = true
    try {
      visible = event.currentTarget.matches(':focus-visible')
    } catch {
      // An older engine: open it.
    }
    if (!visible) {
      return
    }
    keyFocus.current = value
    setIntent(value)
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (root.current?.contains(event.relatedTarget as Node | null)) {
      return
    }
    keyFocus.current = null
    touchOpen.current = null
    setIntent(pointerOver.current ?? doneValue.current)
  }

  // Hover follows the pointer's real moves only: a button sliding under a
  // still pointer must not take over, or two neighbours could trade
  // places back and forth.
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') {
      return
    }
    const at = pointerAt.current
    if (
      at &&
      Math.abs(at.x - event.clientX) < 1 &&
      Math.abs(at.y - event.clientY) < 1
    ) {
      return
    }
    pointerAt.current = { x: event.clientX, y: event.clientY }
    const button = (event.target as HTMLElement).closest<HTMLElement>(ITEM)
    const value = button?.dataset.value
    if (!button || !value || value === pointerOver.current) {
      return
    }
    // A few px into the next action before it opens: resting on a border
    // never flips between two.
    if (pointerOver.current) {
      const box = button.getBoundingClientRect()
      if (
        event.clientX < box.left + HYSTERESIS ||
        event.clientX > box.right - HYSTERESIS
      ) {
        return
      }
    }
    pointerOver.current = value
    setIntent(value)
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') {
      return
    }
    pointerAt.current = null
    pointerOver.current = null
    setIntent(doneValue.current ?? keyFocus.current)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const list = Array.from(
      root.current?.querySelectorAll<HTMLButtonElement>(ITEM) ?? [],
    )
    const index = list.findIndex((button) => button === document.activeElement)
    if (index < 0) {
      return
    }
    const last = list.length - 1
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    const next =
      event.key === forward
        ? index === last
          ? 0
          : index + 1
        : event.key === backward
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1
    if (next < 0) {
      return
    }
    event.preventDefault()
    list[next]?.focus()
  }

  const metric = metrics[size]
  const height = mobile ? 44 : metric.height
  const geometry = {
    height,
    icon: metric.icon,
    start: (height - metric.icon) / 2,
    gap: metric.gap,
    end: metric.end,
  }
  const variables = {
    '--ebg-h': `${geometry.height}px`,
    '--ebg-icon': `${geometry.icon}px`,
    '--ebg-start': `${geometry.start}px`,
    '--ebg-gap': `${geometry.gap}px`,
    '--ebg-end': `${geometry.end}px`,
    ...style,
  } as CSSProperties

  return (
    <MotionScope>
      <ExpandingButtonGroupContext
        value={{
          size,
          geometry,
          expanded,
          tabStop,
          done,
          busy,
          onItemPointerDown,
          onItemClick,
          onItemFocus,
        }}
      >
        <div
          ref={attach}
          role="toolbar"
          // Reached through its actions only (one Tab stop among them).
          tabIndex={-1}
          aria-label={label}
          aria-orientation="horizontal"
          data-slot="expanding-button-group"
          data-size={size}
          style={variables}
          className={cn(
            'relative isolate inline-flex max-w-full flex-none items-center gap-0.5 rounded-full bg-control p-0.75 shadow-button',
            className,
          )}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          {children}
          <span role="status" aria-live="polite" className="sr-only">
            {announcement}
          </span>
        </div>
      </ExpandingButtonGroupContext>
    </MotionScope>
  )
}

export { ExpandingButtonGroup }
export { ExpandingButtonGroupItem } from './expanding-button-group-item.tsx'
export type { ExpandingButtonGroupProps }
export type { ExpandingButtonGroupItemProps } from './expanding-button-group-item.tsx'
