import { createContext, useContext } from 'react'

import type { ColorFormat, Hsva } from './color-math.ts'

/** A saved colour of ColorPicker's swatches. */
export type ColorSwatch = { id: string; color: string }

/** The thumb being dragged, which then follows the pointer tightly. */
export type ColorPickerDrag = 'area' | 'hue' | 'alpha' | null

export type ColorPickerState = {
  hsva: Hsva
  /** « #2F6BFF », with alpha digits when not opaque. */
  hex: string
  /** The colour as CSS, with and without its opacity. */
  css: string
  opaque: string
  /** The pure hue, for the area's background. */
  pure: string
  commit: (next: Hsva) => void
  label: string
  size: 'sm' | 'default' | 'lg'
  disabled: boolean
  contrastWith: string | undefined
  formats: readonly ColorFormat[]
  alpha: boolean
  swatches: readonly ColorSwatch[]
  setSwatches: (next: ColorSwatch[]) => void
  maxSwatches: number
  drag: ColorPickerDrag
  setDrag: (drag: ColorPickerDrag) => void
}

export const ColorPickerContext = createContext<ColorPickerState | null>(null)

/** ColorPicker's state, for its parts. */
export function useColorPicker(): ColorPickerState {
  const state = useContext(ColorPickerContext)
  if (!state) {
    throw new Error('ColorPicker parts must sit inside <ColorPicker>.')
  }
  return state
}

/** A checkerboard from the theme's tokens, so a see-through colour reads as such, in light and dark. */
export const CHECKER =
  'repeating-conic-gradient(var(--line) 0 25%, var(--surface) 0 50%) 0 0 / 10px 10px'

/** Duration springs restated as stiffness and damping, so a retarget keeps its speed (Arc UI's `physical`). */
function physical(visualDuration: number) {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return {
    type: 'spring' as const,
    stiffness: root * root,
    damping: 2 * root,
    mass: 1,
    restDelta: 0.0005,
    restSpeed: 0.005,
  }
}

/** A thumb after a click: a quick settle, no overshoot. */
export const thumbSpring = physical(0.2)
/** A thumb under a finger: glued to it. */
export const dragSpring = physical(0.1)
