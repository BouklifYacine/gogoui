// Swipe actions, after Arc UI (https://uiarc.dev, MIT licence, Elia
// Kuratli), on GoGoUI's tokens, colours and RowActionsMenu.
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'

import { MotionScope } from '../internal/motion-scope.tsx'
import { SwipeGroupContext } from '../internal/swipe-physics.ts'
import { cn } from '../lib/cn.ts'

type SwipeActionsProps = {
  /** The list's name, for a screen reader (« Demandes »). */
  'aria-label': string
  /** `SwipeActionsRow`s, each with a `key`. */
  children: ReactNode
  className?: string
}

/**
 * A list whose rows reveal actions on a sideways swipe, the way a mail
 * inbox does. One row opens at a time; a press elsewhere or Escape puts it
 * away. Every row also has its « … » menu with the same actions.
 *
 * **Use it for** a short list sorted quickly on a phone (requests to
 * answer, clients, resources). **Not for** a table on a computer
 * (`RowActionsMenu` in its last cell), or a list with no action.
 *
 * **Where**: a page's main list on a phone; the swipe works with a mouse
 * too.
 *
 * **States**: rows closed, one open, a row leaving (its height closes), the
 * frame fading once the last row has left, hidden when empty.
 *
 * **Compose**: `SwipeActions` > `SwipeActionsRow`s (`name`, `leading`,
 * `trailing`). Remove the item in the action's `onSelect`: the row leaves
 * with its exit; an item kept comes back after 1.4s.
 *
 * **Key props**: `aria-label`.
 *
 * **Accessibility**: a `list` named by `aria-label`; the gesture is only a
 * shortcut, the « … » menu of each row is the way for a keyboard and a
 * screen reader. Motion reduced: the rows jump instead of sliding.
 *
 * @summary A list whose rows reveal actions on a sideways swipe.
 */
function SwipeActions({
  'aria-label': label,
  children,
  className,
}: SwipeActionsProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [rows] = useState(() => new Map<string, HTMLElement>())

  // While a row is open, a press outside it or Escape puts it away. A
  // callback ref, run again each time another row opens.
  const watchOutside = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !openId) {
        return undefined
      }
      const onPointerDown = (event: PointerEvent) => {
        const row = rows.get(openId)
        if (row && event.target instanceof Node && row.contains(event.target)) {
          return
        }
        setOpenId(null)
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpenId(null)
        }
      }
      document.addEventListener('pointerdown', onPointerDown, true)
      document.addEventListener('keydown', onKeyDown)
      return () => {
        document.removeEventListener('pointerdown', onPointerDown, true)
        document.removeEventListener('keydown', onKeyDown)
      }
    },
    [openId, rows],
  )

  const group = useMemo(() => ({ openId, setOpenId, rows }), [openId, rows])

  return (
    <MotionScope>
      <SwipeGroupContext.Provider value={group}>
        <div
          ref={watchOutside}
          data-slot="swipe-actions"
          className={cn(
            // The frame clips the rows, so revealed actions never spill
            // past its corners; it fades with the last row leaving.
            'overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,background-color] duration-200 ease-standard motion-reduce:transition-none',
            '[&:not(:has(>ul>li:not([data-removing])))]:border-transparent [&:not(:has(>ul>li:not([data-removing])))]:bg-transparent has-[>ul:empty]:hidden',
            className,
          )}
        >
          {/* Pulled down a pixel: the last row's line tucks under the frame. */}
          <ul aria-label={label} className="m-0 -mb-px list-none p-0">
            <AnimatePresence initial={false}>{children}</AnimatePresence>
          </ul>
        </div>
      </SwipeGroupContext.Provider>
    </MotionScope>
  )
}

export { SwipeActions }
export type { SwipeActionsProps }
