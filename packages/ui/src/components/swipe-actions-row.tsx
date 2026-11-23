// A row of SwipeActions, after Arc UI (https://uiarc.dev, MIT licence, Elia
// Kuratli), on GoGoUI's tokens, colours and RowActionsMenu.
import { useCallback, useContext, useId, useRef, useState } from 'react'
import type { FocusEvent, MouseEvent, PointerEvent, ReactNode } from 'react'
import { animate, motion, useIsPresent, useMotionValue } from 'motion/react'
import type { AnimationPlaybackControls } from 'motion/react'

import { useReduceMotion } from '../i18n/motion-context.ts'
import type { Color } from '../internal/colors.ts'
import { duration, ease, spring } from '../internal/motion.ts'
import type { RowAction } from '../internal/row-action-item.tsx'
import { SwipeActionLayer } from '../internal/swipe-action-layer.tsx'
import {
  ACTION,
  FLICK,
  PROJECTION,
  SLOP,
  SwipeGroupContext,
  rubberBand,
  sideOf,
  velocityOf,
} from '../internal/swipe-physics.ts'
import type { Side } from '../internal/swipe-physics.ts'
import { cn } from '../lib/cn.ts'
import { RowActionsMenu } from './row-actions-menu.tsx'

/** A row's action: RowActionsMenu's, with a colour and a way to keep the row. */
type SwipeAction = RowAction & {
  /** The revealed fill; `danger` when `destructive`, `neutral` otherwise. */
  color?: Color
  /** The row springs home after the action instead of leaving (« Marquer comme lu »). */
  keepRow?: boolean
}

type SwipeActionsRowProps = {
  /** What the row is called, for its « … » menu (« Actions « Grange » »). */
  name: string
  /** Under the left edge, revealed by a swipe to the right. */
  leading?: SwipeAction[]
  /** Under the right edge, revealed by a swipe to the left. */
  trailing?: SwipeAction[]
  /** A long swipe runs the outermost action without a tap. On by default. */
  fullSwipe?: boolean
  children: ReactNode
  className?: string
}

type Drag = {
  pointer: number
  type: string
  startX: number
  startY: number
  origin: number
  locked: 'x' | 'y' | null
  samples: [number, number][]
}

const colorOf = (action: SwipeAction): Color =>
  action.color ?? (action.destructive ? 'danger' : 'neutral')

/**
 * One row of `SwipeActions`: swiped sideways, it reveals its actions; a
 * long swipe runs the outermost one. Its « … » menu (`RowActionsMenu`)
 * holds the same actions.
 *
 * **Use it for** each item of a short list sorted quickly on a phone
 * (requests, clients, resources). **Not for** a table on a computer
 * (`RowActionsMenu` alone).
 *
 * **Where**: only inside `SwipeActions`, each with a `key`.
 *
 * **States**: closed, dragging, open on one side, armed (a long swipe
 * stretches the outermost action), leaving (it slides away and the list
 * closes the gap), back (an item that stays slides home after 1.4s).
 *
 * **Key props**: `name`, `leading`, `trailing` (RowActionsMenu's actions
 * with `color` and `keepRow`), `fullSwipe`.
 *
 * **Accessibility**: the revealed actions are hidden from the keyboard and
 * screen readers; the « … » menu is their way, and after a deletion the
 * focus moves to the next row's menu. Vertical swipes stay the page's
 * scroll.
 *
 * @summary A list row whose actions show on a sideways swipe.
 */
function SwipeActionsRow({
  name,
  leading = [],
  trailing = [],
  fullSwipe = true,
  children,
  className,
}: SwipeActionsRowProps) {
  const { openId, setOpenId, rows } = useContext(SwipeGroupContext)
  const id = useId()
  const reduce = useReduceMotion()
  const present = useIsPresent()
  const x = useMotionValue(0)
  const cover = useMotionValue(0)
  const [covering, setCovering] = useState<{
    side: Side
    index: number
  } | null>(null)
  const rowRef = useRef<HTMLLIElement | null>(null)
  const rowCleanup = useRef<(() => void) | null>(null)
  const width = useRef(0)
  const drag = useRef<Drag | null>(null)
  const travel = useRef<AnimationPlaybackControls | null>(null)
  const stretch = useRef<AnimationPlaybackControls | null>(null)
  const armed = useRef(false)
  const leaving = useRef(false)
  const swallowClick = useRef(false)
  const focusNeighbour = useRef(false)
  const restoreTimer = useRef(0)

  const actionsOf = (side: Side) => (side === 'leading' ? leading : trailing)
  const openWidth = (side: Side) => actionsOf(side).length * ACTION
  const outermost = (side: Side) =>
    side === 'leading' ? 0 : trailing.length - 1
  const canCommit = (side: Side) => fullSwipe && actionsOf(side).length > 0
  const threshold = (side: Side) =>
    Math.max(openWidth(side) + 48, width.current * 0.56)

  const stretchTo = (value: number) => {
    stretch.current?.stop()
    if (reduce) {
      cover.jump(value)
      return
    }
    stretch.current = animate(cover, value, spring.morph)
  }

  // Springs the row to a stop, carrying the release's speed.
  const settle = (target: number, velocity = 0) => {
    if (armed.current || (target !== 0 && cover.get() !== 0)) {
      stretchTo(0)
    }
    armed.current = false
    const from = x.get()
    const home = () => {
      if (target === 0) {
        stretch.current?.stop()
        cover.jump(0)
      }
    }
    if (reduce) {
      x.jump(target)
      home()
    } else {
      // Heading home, the spring may not carry the row past zero, or the
      // other side's actions would flash.
      const toward = target === 0 && Math.sign(velocity) === -Math.sign(from)
      const launch = toward
        ? Math.sign(velocity) *
          Math.min(Math.abs(velocity), Math.abs(from) * 12)
        : velocity
      travel.current = animate(x, target, {
        ...(target === 0 ? spring.smooth : spring.snappy),
        velocity: launch,
        onComplete: home,
      })
    }
    if (target === 0) {
      setOpenId((current) => (current === id ? null : current))
    } else {
      setOpenId(id)
    }
  }

  const putBack = () => {
    if (!leaving.current) {
      return
    }
    leaving.current = false
    window.clearTimeout(restoreTimer.current)
    if (rowRef.current) {
      delete rowRef.current.dataset.removing
    }
    settle(0)
  }

  // The chosen action stretches over the row while the row leaves its way;
  // the list then closes the gap.
  const commit = (side: Side, index: number, velocity = 0) => {
    const action = actionsOf(side)[index]
    if (!action || action.disabled || leaving.current) {
      return
    }
    const direction = side === 'leading' ? 1 : -1
    armed.current = false
    setCovering({ side, index })
    stretchTo(1)
    if (action.keepRow) {
      action.onSelect()
      settle(0, velocity)
      return
    }
    leaving.current = true
    const row = rowRef.current
    if (row) {
      row.dataset.removing = ''
    }
    travel.current?.stop()
    const end = direction * (width.current + 2)
    if (reduce) {
      x.jump(end)
    } else {
      travel.current = animate(x, end, {
        ...spring.smooth,
        velocity: Math.sign(velocity) === direction ? velocity : 0,
      })
    }
    setOpenId((current) => (current === id ? null : current))
    action.onSelect()
    // A list that keeps the item gets its row back, not a band of colour.
    window.clearTimeout(restoreTimer.current)
    restoreTimer.current = window.setTimeout(putBack, 1400)
  }

  const arm = (value: number, pointerType: string) => {
    const side = sideOf(value)
    if (!side) {
      if (armed.current) {
        armed.current = false
        stretchTo(0)
      }
      return
    }
    const limit = threshold(side)
    // Disarms 20px before it armed, so it does not flicker at the line.
    const next =
      canCommit(side) && Math.abs(value) > (armed.current ? limit - 20 : limit)
    if (next === armed.current) {
      return
    }
    armed.current = next
    if (next) {
      setCovering({ side, index: outermost(side) })
      if (pointerType === 'touch' && !reduce) {
        navigator.vibrate?.(8)
      }
    }
    stretchTo(next ? 1 : 0)
  }

  const constrain = (raw: number) => {
    const side = sideOf(raw)
    if (!side) {
      return 0
    }
    const dimension = width.current || 320
    const limit =
      actionsOf(side).length === 0
        ? 0
        : canCommit(side)
          ? dimension
          : openWidth(side)
    const distance = Math.abs(raw)
    return (
      Math.sign(raw) *
      (distance <= limit
        ? distance
        : limit + rubberBand(distance - limit, dimension))
    )
  }

  const release = (velocity: number) => {
    const value = x.get()
    const side = sideOf(value)
    if (!side || actionsOf(side).length === 0) {
      settle(0, velocity)
      return
    }
    const direction = side === 'leading' ? 1 : -1
    const distance = Math.abs(value)
    const outward = velocity * direction
    const open = openWidth(side)
    const projected = distance + outward * PROJECTION
    const flung =
      distance > open && outward > FLICK && projected > threshold(side)
    // A flick back home cancels an armed long swipe.
    if (canCommit(side) && ((armed.current && outward > -FLICK) || flung)) {
      commit(side, outermost(side), velocity)
      return
    }
    settle(projected > open / 2 ? direction * open : 0, velocity)
  }

  // Capture phase: the « … » button stops the press from reaching its own
  // trigger, so the row must see it first.
  const onPointerDownCapture = (event: PointerEvent<HTMLDivElement>) => {
    swallowClick.current = false
    if (
      leaving.current ||
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return
    }
    // Caught mid-flight, the next move carries on from where it is.
    travel.current?.stop()
    drag.current = {
      pointer: event.pointerId,
      type: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      origin: x.get(),
      locked: null,
      samples: [[event.timeStamp, event.clientX]],
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) {
      return
    }
    if (current.locked === 'y') {
      return
    }
    if (!current.locked) {
      const dx = event.clientX - current.startX
      const dy = event.clientY - current.startY
      if (Math.hypot(dx, dy) < SLOP) {
        return
      }
      if (Math.abs(dy) > Math.abs(dx)) {
        current.locked = 'y'
        return
      }
      // Measured from here, so crossing the slop never jumps the row.
      current.locked = 'x'
      current.startX = event.clientX
      event.currentTarget.setPointerCapture(event.pointerId)
      if (rowRef.current) {
        rowRef.current.dataset.dragging = ''
      }
      setOpenId(id)
    }
    const value = constrain(current.origin + event.clientX - current.startX)
    x.set(value)
    current.samples.push([event.timeStamp, event.clientX])
    if (current.samples.length > 12) {
      current.samples.shift()
    }
    arm(value, current.type)
  }

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) {
      return
    }
    drag.current = null
    if (current.locked === 'x') {
      swallowClick.current = true
      if (rowRef.current) {
        delete rowRef.current.dataset.dragging
      }
      current.samples.push([event.timeStamp, event.clientX])
      release(event.type === 'pointercancel' ? 0 : velocityOf(current.samples))
      return
    }
    // A tap on an open row closes it instead of acting on what is under.
    if (current.locked === null && Math.abs(x.get()) > 0.5) {
      swallowClick.current = true
      settle(0)
    }
  }

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!swallowClick.current) {
      return
    }
    swallowClick.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  // After a deletion from the menu, the focus goes to the next row's menu
  // (or the one before), never lost on the page.
  const moveFocusToNeighbour = () => {
    const row = rowRef.current
    if (!row) {
      return
    }
    const staying = (step: 'nextElementSibling' | 'previousElementSibling') => {
      let node = row[step]
      while (node instanceof HTMLElement && 'removing' in node.dataset) {
        node = node[step]
      }
      return node
    }
    const neighbour =
      staying('nextElementSibling') ?? staying('previousElementSibling')
    neighbour
      ?.querySelector<HTMLElement>('[data-swipe-more] button')
      ?.focus({ preventScroll: true })
  }

  // The menu gives the focus back to its button as it closes: right then,
  // a deleted row hands it on.
  const onMenuFocus = (event: FocusEvent<HTMLSpanElement>) => {
    if (!focusNeighbour.current || !(event.target instanceof HTMLElement)) {
      return
    }
    focusNeighbour.current = false
    moveFocusToNeighbour()
  }

  // The row's element: it joins the list, and its width is followed. Kept
  // apart from React's ref cleanup, which motion handles its own way.
  const watchRow = useCallback(
    (row: HTMLLIElement | null) => {
      rowCleanup.current?.()
      rowCleanup.current = null
      rowRef.current = row
      if (!row) {
        return
      }
      rows.set(id, row)
      width.current = row.offsetWidth
      const observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(([entry]) => {
              if (entry) {
                width.current = entry.contentRect.width
              }
            })
      observer?.observe(row)
      rowCleanup.current = () => {
        observer?.disconnect()
        rows.delete(id)
        window.clearTimeout(restoreTimer.current)
        setOpenId((current) => (current === id ? null : current))
      }
    },
    [id, rows, setOpenId],
  )

  // Another row opened, or a press landed outside: this one goes home. A
  // plain element's callback ref, run again each time `openId` changes.
  const closeForOthers = useCallback(
    (node: HTMLDivElement | null) => {
      if (
        node &&
        openId !== id &&
        !leaving.current &&
        drag.current?.locked !== 'x' &&
        x.get() !== 0
      ) {
        armed.current = false
        stretch.current?.stop()
        if (reduce) {
          x.jump(0)
          cover.jump(0)
        } else {
          travel.current = animate(x, 0, {
            ...spring.smooth,
            onComplete: () => cover.jump(0),
          })
        }
      }
    },
    [openId, id, reduce, x, cover],
  )

  // An undo brought the item back while it was leaving: it slides home as
  // its height opens again.
  const returnHome = useCallback(
    (node: HTMLSpanElement | null) => {
      if (node && present && leaving.current) {
        leaving.current = false
        window.clearTimeout(restoreTimer.current)
        if (rowRef.current) {
          delete rowRef.current.dataset.removing
        }
        travel.current?.stop()
        if (reduce) {
          x.jump(0)
          cover.jump(0)
        } else {
          travel.current = animate(x, 0, {
            ...spring.smooth,
            onComplete: () => cover.jump(0),
          })
        }
      }
    },
    [present, reduce, x, cover],
  )

  // The menu runs the same actions, through the same motion.
  const menuActions = [
    ...leading.map((action, index) => ({
      action,
      side: 'leading' as const,
      index,
    })),
    ...trailing.map((action, index) => ({
      action,
      side: 'trailing' as const,
      index,
    })),
  ].map(({ action, side, index }) => ({
    label: action.label,
    icon: action.icon,
    disabled: action.disabled,
    destructive: action.destructive ?? colorOf(action) === 'danger',
    onSelect: () => {
      focusNeighbour.current = !action.keepRow
      commit(side, index)
    },
  }))

  const collapse = reduce
    ? { opacity: 0, transition: { duration: duration.fast } }
    : {
        height: 0,
        opacity: 0,
        transition: {
          height: { ...spring.smooth, delay: 0.12 },
          opacity: { duration: duration.instant, delay: 0.34 },
        },
      }

  return (
    <motion.li
      ref={watchRow}
      data-slot="swipe-actions-row"
      className={cn(
        'group/swipe-row relative isolate overflow-hidden',
        className,
      )}
      initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={collapse}
      transition={
        reduce
          ? { duration: duration.fast }
          : {
              height: spring.smooth,
              opacity: { duration: duration.standard, ease: ease.enter },
            }
      }
    >
      <span ref={returnHome} hidden />
      {(['leading', 'trailing'] as const).map((side) =>
        actionsOf(side).map((action, index) => {
          const count = actionsOf(side).length
          const rank = side === 'leading' ? count - 1 - index : index
          const coverRank =
            covering?.side === side
              ? side === 'leading'
                ? count - 1 - covering.index
                : covering.index
              : null
          return (
            <SwipeActionLayer
              key={`${side}-${action.label}`}
              label={action.label}
              icon={action.icon}
              color={colorOf(action)}
              side={side}
              rank={rank}
              count={count}
              coverRank={coverRank}
              x={x}
              cover={cover}
              onPress={() => commit(side, index)}
            />
          )
        }),
      )}
      <motion.div
        className={cn(
          'relative z-10 flex min-h-16 touch-pan-y items-center gap-2 bg-surface py-3 pr-2 pl-4 select-none [-webkit-touch-callout:none] pointer-fine:cursor-grab group-data-dragging/swipe-row:cursor-grabbing',
          // The line under each row, tucked under the frame on the last.
          'after:pointer-events-none after:absolute after:right-0 after:bottom-0 after:left-4 after:h-px after:bg-line',
          '[&_img]:[-webkit-user-drag:none]',
        )}
        style={{ x }}
        onPointerDownCapture={onPointerDownCapture}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
      >
        <div ref={closeForOthers} className="min-w-0 flex-1">
          {children}
        </div>
        {menuActions.length > 0 && (
          // The « … » opens on a click, not on a press: a swipe that starts
          // on it still moves the row.
          <span
            data-swipe-more=""
            className="contents"
            onPointerDownCapture={(event) => event.stopPropagation()}
            onMouseDownCapture={(event) => event.stopPropagation()}
            onFocus={onMenuFocus}
          >
            <RowActionsMenu name={name} actions={menuActions} />
          </span>
        )}
      </motion.div>
    </motion.li>
  )
}

export { SwipeActionsRow }
export type { SwipeAction, SwipeActionsRowProps }
