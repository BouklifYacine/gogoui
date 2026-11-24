/*
 * Colour maths for GoGoUI's themes, with no dependency so it runs on a
 * server too: hex in and out, the WCAG luminance and contrast, and OKLab /
 * OKLCH (https://bottosson.github.io/posts/oklab/, the space CSS uses for
 * `color-mix(in oklab, …)` and `oklch(from …)`). sRGB channels are 0 to 1.
 */

/** A colour in sRGB, each channel 0 to 1. */
export type Rgb = { r: number; g: number; b: number }

/** A colour in OKLCH: lightness 0 to 1, chroma from 0, hue in degrees. */
export type Oklch = { l: number; c: number; h: number }

type Oklab = { l: number; a: number; b: number }

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** Reads `#rgb` or `#rrggbb` (the `#` optional); null for anything else. */
export function parseHex(text: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim())
  if (!match?.[1]) return null
  const digits =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : match[1]
  const channel = (at: number) => parseInt(digits.slice(at, at + 2), 16) / 255
  return { r: channel(0), g: channel(2), b: channel(4) }
}

/** The colour as `#rrggbb`, lower case. */
export function toHex({ r, g, b }: Rgb): string {
  const byte = (channel: number) =>
    Math.round(clamp01(channel) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${byte(r)}${byte(g)}${byte(b)}`
}

const toLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
const fromLinear = (channel: number) =>
  channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055

/** The WCAG relative luminance: 0 for black, 1 for white. */
export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** The WCAG contrast ratio of two colours, 1 to 21. */
export function contrast(first: Rgb, second: Rgb): number {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (x, y) => y - x,
  )
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)
}

function toOklab({ r, g, b }: Rgb): Oklab {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

/** Unclipped: a channel may fall outside 0 to 1 when out of sRGB. */
function fromOklab({ l: L, a: A, b: B }: Oklab): Rgb {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  }
}

/** The colour in OKLCH. */
export function toOklch(rgb: Rgb): Oklch {
  const { l, a, b } = toOklab(rgb)
  const hue = (Math.atan2(b, a) * 180) / Math.PI
  return { l, c: Math.hypot(a, b), h: hue < 0 ? hue + 360 : hue }
}

const isInSrgb = ({ r, g, b }: Rgb) =>
  [r, g, b].every((channel) => channel >= -0.0001 && channel <= 1.0001)

function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const angle = (h * Math.PI) / 180
  return fromOklab({ l, a: c * Math.cos(angle), b: c * Math.sin(angle) })
}

/**
 * The OKLCH colour in sRGB. When it lies outside, its chroma shrinks until
 * it fits, so the lightness and the hue stay what was asked.
 */
export function fromOklch(color: Oklch): Rgb {
  if (isInSrgb(oklchToRgb(color))) return clampRgb(oklchToRgb(color))
  let low = 0
  let high = color.c
  for (let step = 0; step < 24; step++) {
    const middle = (low + high) / 2
    if (isInSrgb(oklchToRgb({ ...color, c: middle }))) low = middle
    else high = middle
  }
  return clampRgb(oklchToRgb({ ...color, c: low }))
}

function clampRgb({ r, g, b }: Rgb): Rgb {
  return { r: clamp01(r), g: clamp01(g), b: clamp01(b) }
}

/**
 * What CSS draws for `color-mix(in oklab, color share, other)`: `share`
 * (0 to 1) of the first colour, the rest of the second.
 */
export function mixOklab(color: Rgb, other: Rgb, share: number): Rgb {
  const first = toOklab(color)
  const second = toOklab(other)
  const blend = (x: number, y: number) => x * share + y * (1 - share)
  return clampRgb(
    fromOklab({
      l: blend(first.l, second.l),
      a: blend(first.a, second.a),
      b: blend(first.b, second.b),
    }),
  )
}

/**
 * What CSS draws for `color-mix(in srgb, color share, transparent)` laid
 * on an opaque background: a tint of the colour over that background.
 */
export function tintOver(color: Rgb, background: Rgb, share: number): Rgb {
  const blend = (x: number, y: number) => x * share + y * (1 - share)
  return {
    r: blend(color.r, background.r),
    g: blend(color.g, background.g),
    b: blend(color.b, background.b),
  }
}
