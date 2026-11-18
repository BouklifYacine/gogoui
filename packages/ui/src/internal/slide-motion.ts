// The slide's physics, after Kokonut UI (https://kokonutui.com, MIT
// licence, kokonutUI).

export const EASE_OUT = [0.23, 1, 0.32, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
export const HEIGHT = 56
export const INSET = 4
export const THUMB = HEIGHT - INSET * 2
/** Share of the track the thumb must cross before letting go commits. */
export const COMMIT_AT = 0.9
/** A flick this fast (px/s) commits from FLICK_FROM of the way along. */
export const FLICK_SPEED = 900
export const FLICK_FROM = 0.45
/** How far past either end the thumb stretches, at most. */
export const OVERDRAG = 8
/** A press that moves less than this is a tap. */
export const TAP_SLOP = 4

export type Phase = 'idle' | 'dragging' | 'confirming' | 'done'

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Past the ends the thumb follows less and less: it stretches instead of
// stopping dead against the edge.
export function band(raw: number, max: number) {
  if (raw > max) {
    return max + OVERDRAG * (1 - Math.exp(-(raw - max) / 40))
  }
  if (raw < 0) {
    return -OVERDRAG * (1 - Math.exp(raw / 40))
  }
  return raw
}
