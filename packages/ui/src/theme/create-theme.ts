import { contrast, fromOklch, parseHex, toHex, toOklch } from './color.ts'
import type { Rgb } from './color.ts'

/** What a theme gives one side (light or dark) of the interface. */
export type ThemeSide = {
  /** The brand colour of that side, as `#rrggbb`. */
  brand: string
  /** The text on the brand: white or near black, as `#rrggbb`. */
  foreground: string
  /** The contrast of the foreground on the brand, rounded down (2 decimals). */
  contrast: number
  /** True when that contrast reaches WCAG AA for text (4.5:1). */
  readable: boolean
}

/** A brand theme for GoGoUI, ready to paste in a stylesheet. */
export type GoGoUITheme = {
  /**
   * The CSS: a light block (`:root, :where(.light)`) and a dark one
   * (`.dark`), each setting `--brand` and `--brand-foreground`.
   */
  css: string
  light: ThemeSide
  dark: ThemeSide
}

const WHITE = '#ffffff'
const NEAR_BLACK = '#0a0a0a'
const BLACK = '#000000'

/** WCAG AA for text, the bar the foreground must reach on the brand. */
const TEXT_CONTRAST = 4.5

/*
 * At night the brand sits on a black page: a dark brand would sink into
 * it, so the dark side lifts it to this OKLCH lightness at least (the
 * 400 step of a Tailwind scale), keeping its hue.
 */
const DARK_SIDE_MIN_LIGHTNESS = 0.72

const roundDown = (ratio: number) => Math.floor(ratio * 100) / 100

/**
 * White when it reaches 4.5:1 on the brand, else near black (#0a0a0a);
 * plain black in the thin band where near black falls just short. One of
 * white and black always reaches 4.5:1.
 */
function pickForeground(brand: Rgb): string {
  for (const candidate of [WHITE, NEAR_BLACK]) {
    const text = parseHex(candidate) as Rgb
    if (contrast(text, brand) >= TEXT_CONTRAST) return candidate
  }
  return BLACK
}

function describeSide(brand: Rgb): ThemeSide {
  const foreground = pickForeground(brand)
  const ratio = roundDown(contrast(parseHex(foreground) as Rgb, brand))
  return {
    brand: toHex(brand),
    foreground,
    contrast: ratio,
    readable: ratio >= TEXT_CONTRAST,
  }
}

function liftForDarkSide(brand: Rgb): Rgb {
  const oklch = toOklch(brand)
  if (oklch.l >= DARK_SIDE_MIN_LIGHTNESS) return brand
  return fromOklch({ ...oklch, l: DARK_SIDE_MIN_LIGHTNESS })
}

function block(selector: string, side: ThemeSide): string {
  return [
    `${selector} {`,
    `  --brand: ${side.brand};`,
    `  --brand-foreground: ${side.foreground};`,
    '}',
  ].join('\n')
}

/**
 * Turns one brand colour into a GoGoUI theme: the CSS for the light and
 * the dark interface, with a foreground (white or near black) that reads
 * at 4.5:1 on the brand, and that contrast reported for each side.
 *
 * The light side keeps the colour as given. The dark side lifts a dark
 * colour so it stays visible on the black page.
 *
 * Use it for: a brand picked at runtime (one per customer, per venue), or
 * to print the CSS of a brand once and paste it after GoGoUI's styles.
 *
 * @param color The brand, as `#rgb` or `#rrggbb`.
 * @throws When the colour is not a hex colour.
 *
 * @example
 * const theme = createTheme('#1a66fe')
 * theme.css // ':root, :where(.light) { --brand: #1a66fe; … } .dark { … }'
 * theme.light.contrast // 4.79
 *
 * @summary One brand colour in, GoGoUI's light and dark brand CSS out.
 */
export function createTheme(color: string): GoGoUITheme {
  const brand = parseHex(color)
  if (!brand) {
    throw new Error(
      `createTheme: "${color}" is not a hex colour (#rgb or #rrggbb).`,
    )
  }
  const light = describeSide(brand)
  const dark = describeSide(liftForDarkSide(brand))
  const css = `${block(':root,\n:where(.light)', light)}\n\n${block('.dark', dark)}\n`
  return { css, light, dark }
}
