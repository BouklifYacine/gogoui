import { useState } from 'react'
import type { FocusEvent, KeyboardEvent, PointerEvent } from 'react'

import { clamp } from './chart-scale.ts'

type ScrubOptions = {
  /** How many readings there are, oldest first. */
  count: number
  /** The reading under a pointer at this x, in page px. */
  indexAt: (clientX: number) => number
  /** A new value here (new data) lets go of the reading. */
  resetKey?: string
  /** Told each new reading, and null when it is let go. */
  onChange?: (index: number | null) => void
}

/**
 * Exploring a chart's readings one at a time, after Arc UI's charts
 * (https://uiarc.dev, MIT): hover or drag across the plot, or focus it and
 * use the arrows (Page up / Page down jump a sixth, Home / End go to the
 * ends, Escape lets go). A finger lets go when it lifts; vertical swipes
 * still scroll the page (`touch-action: pan-y` on the element).
 *
 * Spread `handlers` on the element with `role="slider"`; `index` is the
 * reading explored, null at rest.
 */
export function useChartScrub({
  count,
  indexAt,
  resetKey = '',
  onChange,
}: ScrubOptions) {
  const [active, setActive] = useState<number | null>(null)
  const [seenKey, setSeenKey] = useState(resetKey)
  if (seenKey !== resetKey) {
    setSeenKey(resetKey)
    setActive(null)
  }
  const last = count - 1
  const index = active === null || count === 0 ? null : Math.min(active, last)

  const move = (next: number | null) => {
    const to = next === null || count === 0 ? null : clamp(next, 0, last)
    if (to === index) {
      return
    }
    setActive(to)
    onChange?.(to)
  }
  const at = (clientX: number) => clamp(indexAt(clientX), 0, Math.max(0, last))

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (count === 0) {
        return
      }
      if (event.pointerType !== 'mouse') {
        event.currentTarget.setPointerCapture?.(event.pointerId)
      }
      move(at(event.clientX))
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (count > 0 && (event.pointerType === 'mouse' || event.buttons)) {
        move(at(event.clientX))
      }
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse') {
        move(null)
      }
    },
    onPointerCancel: () => move(null),
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') {
        move(null)
      }
    },
    onBlur: () => move(null),
    // A keyboard arrival starts on the latest reading.
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (count > 0 && event.currentTarget.matches(':focus-visible')) {
        move(index ?? last)
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape' && index !== null) {
        event.preventDefault()
        move(null)
        return
      }
      const from = index ?? last + 1
      const page = Math.max(1, Math.round(count / 6))
      const forward = index === null ? last : from + 1
      const next = (
        {
          ArrowLeft: from - 1,
          ArrowDown: from - 1,
          ArrowRight: forward,
          ArrowUp: forward,
          PageDown: from - page,
          PageUp: from + page,
          Home: 0,
          End: last,
        } as Record<string, number>
      )[event.key]
      if (next === undefined || count === 0) {
        return
      }
      event.preventDefault()
      move(next)
    },
  }

  return { index, handlers }
}
