// Colour maths for ColorPicker, after Arc UI's colour picker
// (https://uiarc.dev, MIT): HSV for the picker, read and written as hex,
// rgb(), hsl() or oklch(), and the WCAG contrast. sRGB channels are 0 to 1.

/** A colour as the picker holds it: hue in degrees, the rest 0 to 1. */
export type Hsva = { h: number; s: number; v: number; a: number }
type Rgba = { r: number; g: number; b: number; a: number }

/** The ways a colour can be written in the picker's field. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

export const formatNames: Record<ColorFormat, string> = {
  hex: 'HEX',
  rgb: 'RGB',
  hsl: 'HSL',
  oklch: 'OKLCH',
}

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))
const round = (value: number, digits = 0) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  return { r: f(5), g: f(3), b: f(1), a }
}

function rgbToHsv({ r, g, b, a }: Rgba, hue = 0): Hsva {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = hue
  if (d > 1e-6) {
    if (max === r) h = 60 * (((g - b) / d) % 6)
    else if (max === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : d / max, v: max, a }
}

function hslToRgb(h: number, s: number, l: number, a: number): Rgba {
  const k = (n: number) => (n + h / 30) % 12
  const c = s * Math.min(l, 1 - l)
  const f = (n: number) => l - c * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return { r: f(0), g: f(8), b: f(4), a }
}

function rgbToHsl({ r, g, b }: Rgba, hue: number) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  const s = d < 1e-6 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return { h: d < 1e-6 ? hue : rgbToHsv({ r, g, b, a: 1 }).h, s, l }
}

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const fromLinear = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055

function rgbToOklch({ r, g, b }: Rgba, hue: number) {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B)
  let H = (Math.atan2(B, A) * 180) / Math.PI
  if (H < 0) H += 360
  return { l: L, c: C, h: C < 0.0005 ? hue : H }
}

function oklchToRgb(L: number, C: number, H: number, a: number): Rgba {
  const A = C * Math.cos((H * Math.PI) / 180)
  const B = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return {
    r: clamp(
      fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    ),
    g: clamp(
      fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    ),
    b: clamp(
      fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ),
    a,
  }
}

const byte = (c: number) => Math.round(clamp(c) * 255)
const hex2 = (c: number) => byte(c).toString(16).padStart(2, '0').toUpperCase()

/** « #2F6BFF », with two more digits when it is not opaque. */
export function toHex(hsva: Hsva): string {
  const { r, g, b, a } = hsvToRgb(hsva)
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 0.999 ? hex2(a) : ''}`
}

/** The colour as CSS: `rgb(47 107 255 / 0.5)`; `opaque` drops the opacity. */
export function toCss(hsva: Hsva, opaque = false): string {
  const { r, g, b } = hsvToRgb(hsva)
  return opaque
    ? `rgb(${byte(r)} ${byte(g)} ${byte(b)})`
    : `rgb(${byte(r)} ${byte(g)} ${byte(b)} / ${round(hsva.a, 3)})`
}

/** The colour written in one of the field's formats. */
export function formatColor(hsva: Hsva, kind: ColorFormat): string {
  const rgb = hsvToRgb(hsva)
  const alpha = hsva.a < 0.999 ? ` / ${Math.round(hsva.a * 100)}%` : ''
  if (kind === 'hex') {
    return toHex(hsva)
  }
  if (kind === 'rgb') {
    return `rgb(${byte(rgb.r)} ${byte(rgb.g)} ${byte(rgb.b)}${alpha})`
  }
  if (kind === 'hsl') {
    const { h, s, l } = rgbToHsl(rgb, hsva.h)
    return `hsl(${Math.round(h) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${alpha})`
  }
  const { l, c, h } = rgbToOklch(rgb, hsva.h)
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1) % 360}${alpha})`
}

const readAlpha = (text?: string) =>
  text === undefined
    ? 1
    : text.endsWith('%')
      ? clamp(parseFloat(text) / 100)
      : clamp(parseFloat(text))

/** Reads hex, rgb(), hsl() and oklch(), modern or comma syntax; null for anything else. */
export function parseColor(input: string, hue = 0): Hsva | null {
  const text = input.trim().toLowerCase()
  let match = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text)
  if (match?.[1]) {
    let digits = match[1]
    if (digits.length <= 4) {
      digits = digits
        .split('')
        .map((digit) => digit + digit)
        .join('')
    }
    const n = (i: number) => parseInt(digits.slice(i, i + 2), 16) / 255
    return rgbToHsv(
      { r: n(0), g: n(2), b: n(4), a: digits.length === 8 ? n(6) : 1 },
      hue,
    )
  }
  match =
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(
      text,
    )
  if (match) {
    return rgbToHsv(
      {
        r: clamp(Number(match[1]) / 255),
        g: clamp(Number(match[2]) / 255),
        b: clamp(Number(match[3]) / 255),
        a: readAlpha(match[4]),
      },
      hue,
    )
  }
  match =
    /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(
      text,
    )
  if (match) {
    const h = Number(match[1]) % 360
    const next = rgbToHsv(
      hslToRgb(
        h,
        clamp(Number(match[2]) / 100),
        clamp(Number(match[3]) / 100),
        readAlpha(match[4]),
      ),
      h,
    )
    return { ...next, h }
  }
  match =
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(
      text,
    )
  if (match) {
    const L = match[2] ? Number(match[1]) / 100 : Number(match[1])
    return rgbToHsv(
      oklchToRgb(
        clamp(L),
        Number(match[3]),
        Number(match[4]),
        readAlpha(match[5]),
      ),
      hue,
    )
  }
  return null
}

/** WCAG contrast of a colour laid over a background, against that background. */
export function contrastRatio(hsva: Hsva, background: Hsva | null): number {
  const fg = hsvToRgb(hsva)
  const bg = background ? hsvToRgb(background) : { r: 1, g: 1, b: 1, a: 1 }
  const mix = (c: number, under: number) => c * fg.a + under * (1 - fg.a)
  const lum = (r: number, g: number, b: number) =>
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const a = lum(mix(fg.r, bg.r), mix(fg.g, bg.g), mix(fg.b, bg.b))
  const b = lum(bg.r, bg.g, bg.b)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** The WCAG level a contrast reaches. */
export type ContrastGrade = 'AAA' | 'AA' | 'AA large' | 'fail'

export function contrastGrade(ratio: number): ContrastGrade {
  return ratio >= 7
    ? 'AAA'
    : ratio >= 4.5
      ? 'AA'
      : ratio >= 3
        ? 'AA large'
        : 'fail'
}
