// GoGoUI's motion for `motion/react`, after Arc UI (https://uiarc.dev, MIT
// licence, Elia Kuratli). The CSS side lives in packages/ui/tokens.css
// (--motion-*, `ease-enter`, `ease-spring`…): both say the same thing.
//
// An interface moves in under 300ms, an exit is quicker than its entry, and
// no spring overshoots: sizes and positions settle without a wobble.

/** Durations, in seconds. */
export const duration = {
  instant: 0.1,
  fast: 0.15,
  exit: 0.14,
  standard: 0.2,
  /** The rare larger reveal. */
  considered: 0.36,
} as const

/** Cubic béziers, as `motion` takes them. */
export const ease = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
  standard: [0.22, 1, 0.36, 1],
  /** For what moves while already on screen. */
  inOut: [0.65, 0, 0.35, 1],
} as const

export const spring = {
  responsive: { type: 'spring', stiffness: 520, damping: 44 },
  gentle: { type: 'spring', stiffness: 340, damping: 34 },
  /** Presses, toggles, thumbs and small indicators: settles fast, never overshoots. */
  snappy: { type: 'spring', visualDuration: 0.2, bounce: 0 },
  /** Panels, height changes and layout shifts. */
  smooth: { type: 'spring', visualDuration: 0.3, bounce: 0 },
  /** Shape morphs, shared highlights, and widths that follow new content. */
  morph: { type: 'spring', visualDuration: 0.3, bounce: 0 },
} as const

/** Steps between items appearing one after another, in seconds. Keep the total under 0.4s. */
export const stagger = {
  char: 0.016,
  word: 0.04,
  line: 0.08,
  item: 0.035,
} as const

/** Blur radii, in px, for text and content crossfades: small and brief. */
export const blur = {
  subtle: 2,
  soft: 4,
  text: 8,
} as const
