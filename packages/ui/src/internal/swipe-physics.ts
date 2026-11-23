// The swipe's physics, after Arc UI (https://uiarc.dev, MIT licence, Elia
// Kuratli).
import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/** A row's two sides: under its left edge, under its right edge. */
export type Side = 'leading' | 'trailing'

/** Width of one action while a row rests open, in px. */
export const ACTION = 76
/** Movement before a press is read as a swipe, or left to the page as a scroll. */
export const SLOP = 8
/** Seconds of travel projected from the release speed. */
export const PROJECTION = 0.1
/** A release this fast, in px/s, is a flick. */
export const FLICK = 900

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** Past its last stop the row still follows, each pixel costing more, like elastic. */
export const rubberBand = (overshoot: number, dimension: number) =>
  (1 - 1 / ((overshoot * 0.55) / dimension + 1)) * dimension

export const sideOf = (value: number): Side | null =>
  value > 0 ? 'leading' : value < 0 ? 'trailing' : null

/** The speed of the last 80ms of a drag, in px/s. */
export function velocityOf(samples: [number, number][]) {
  const last = samples.at(-1)
  if (!last) {
    return 0
  }
  const first = samples.find((sample) => last[0] - sample[0] <= 80) ?? last
  const elapsed = (last[0] - first[0]) / 1000
  return elapsed > 0 ? (last[1] - first[1]) / elapsed : 0
}

/** The list's shared state: which row is open, and every row's element. */
export type SwipeGroup = {
  openId: string | null
  setOpenId: Dispatch<SetStateAction<string | null>>
  rows: Map<string, HTMLElement>
}

export const SwipeGroupContext = createContext<SwipeGroup>({
  openId: null,
  setOpenId: () => undefined,
  rows: new Map(),
})
