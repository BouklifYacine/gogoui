import { readdirSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  contrast,
  fromOklch,
  mixOklab,
  parseHex,
  tintOver,
  toOklch,
} from './src/theme/color.ts'
import type { Rgb } from './src/theme/color.ts'

/*
 * The ready palettes (themes/*.css) checked against WCAG AA with the
 * colours tokens.css derives from --brand. The derivation is replayed
 * here with the numbers read from tokens.css itself, so a change of
 * percentage or lightness there is tested too.
 */

const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8')
const themesDir = new URL('./themes/', import.meta.url)

const LIGHT = ':root,\n:where(.light) {'
const DARK = '\n.dark {'

function blockText(css: string, selector: string): string {
  const start = css.indexOf(selector)
  if (start < 0) throw new Error(`missing block ${selector.trim()}`)
  const open = css.indexOf('{', start)
  return css.slice(open + 1, css.indexOf('\n}', open))
}

function read(css: string, pattern: RegExp): string {
  const match = pattern.exec(css)
  if (!match?.[1]) throw new Error(`not found: ${pattern}`)
  return match[1]
}

function hex(text: string): Rgb {
  const color = parseHex(text)
  if (!color) throw new Error(`not a hex colour: ${text}`)
  return color
}

/** How one theme block of tokens.css turns --brand into the primary. */
function derivation(selector: string) {
  const block = blockText(tokens, selector)
  const mix = (name: string) => {
    const pattern = new RegExp(
      `--${name}: color-mix\\(in oklab, var\\(--brand\\) (\\d+)%, (black|white)\\)`,
    )
    const match = pattern.exec(block)
    if (!match?.[1] || !match[2]) throw new Error(`no mix for --${name}`)
    return { share: Number(match[1]) / 100, toward: match[2] }
  }
  const focus =
    /--brand-focus: oklch\(from var\(--brand\) (min|max)\(l, ([\d.]+)\)/.exec(
      block,
    )
  if (!focus?.[1] || !focus[2]) throw new Error('no --brand-focus')
  return {
    hover: mix('brand-hover'),
    active: mix('brand-active'),
    focusBound: focus[1] as 'min' | 'max',
    focusLightness: Number(focus[2]),
    subtleShare:
      Number(
        read(
          block,
          /--primary-subtle: color-mix\(in srgb, var\(--primary\) (\d+)%/,
        ),
      ) / 100,
    canvas: hex(read(block, /--canvas: (#[0-9a-f]{6});/)),
    surface: hex(read(block, /--surface: (#[0-9a-f]{6});/)),
    floating: hex(read(block, /--floating: (#[0-9a-f]{6});/)),
  }
}

const WHITE = hex('#ffffff')
const BLACK = hex('#000000')

function derive(brand: Rgb, selector: string) {
  const rules = derivation(selector)
  const shade = ({ share, toward }: { share: number; toward: string }) =>
    mixOklab(brand, toward === 'black' ? BLACK : WHITE, share)
  const oklch = toOklch(brand)
  const focusL =
    rules.focusBound === 'min'
      ? Math.min(oklch.l, rules.focusLightness)
      : Math.max(oklch.l, rules.focusLightness)
  return {
    ...rules,
    primary: brand,
    hover: shade(rules.hover),
    active: shade(rules.active),
    focus: fromOklch({ ...oklch, l: focusL }),
  }
}

const palettes = readdirSync(themesDir)
  .filter((file) => file.endsWith('.css'))
  .map((file) => {
    const css = readFileSync(new URL(file, themesDir), 'utf8')
    const side = (selector: string) => {
      const block = blockText(css, selector)
      return {
        brand: hex(read(block, /--brand: (#[0-9a-f]{6});/)),
        foreground: hex(read(block, /--brand-foreground: (#[0-9a-f]{6});/)),
      }
    }
    return {
      name: file.replace('.css', ''),
      light: side(LIGHT),
      dark: side(DARK),
    }
  })

const TEXT = 4.5
const EDGE = 3

it('ships the six palettes', () => {
  expect(palettes.map((palette) => palette.name).sort()).toEqual([
    'ambre',
    'ardoise',
    'bleu',
    'rose',
    'vert',
    'violet',
  ])
})

describe.each(palettes)('palette $name', (palette) => {
  describe.each([
    ['light', LIGHT],
    ['dark', DARK],
  ] as const)('%s theme', (theme, selector) => {
    const { brand, foreground } = palette[theme]
    const colors = derive(brand, selector)
    // The page behind a badge or an alert: the card, and the canvas by
    // day or a popover at night.
    const pages = [
      colors.surface,
      theme === 'light' ? colors.canvas : colors.floating,
    ]

    it('writes the foreground at 4.5:1 on the primary, hovered and pressed', () => {
      expect(contrast(foreground, colors.primary)).toBeGreaterThanOrEqual(TEXT)
      expect(contrast(foreground, colors.hover)).toBeGreaterThanOrEqual(TEXT)
      expect(contrast(foreground, colors.active)).toBeGreaterThanOrEqual(TEXT)
    })

    it('reads the pressed and hovered primary as text at 4.5:1 (soft button, badge, link)', () => {
      for (const page of pages) {
        const tint = tintOver(colors.primary, page, colors.subtleShare)
        expect(contrast(colors.active, tint)).toBeGreaterThanOrEqual(TEXT)
        expect(contrast(colors.hover, page)).toBeGreaterThanOrEqual(TEXT)
      }
    })

    it('draws the focus outline at 3:1 on the canvas', () => {
      expect(contrast(colors.focus, colors.canvas)).toBeGreaterThanOrEqual(EDGE)
    })
  })
})

describe('the automatic foreground (--brand-foreground-auto)', () => {
  const light = blockText(tokens, LIGHT)
  const whiteUpTo = Number(read(light, /clamp\(0, \(([\d.]+) - \(0\.2126/))
  const nearBlackFrom = Number(read(light, /0\.0722 \* b - ([\d.]+)\)/))
  const nearBlack = Number(read(light, /\+\s*([\d.]+) \*\s*clamp/))

  it('keeps white only while it reads at 4.5:1', () => {
    // White on a colour of luminance Y: 1.05 / (Y + 0.05).
    expect(1.05 / (whiteUpTo + 0.05)).toBeGreaterThanOrEqual(TEXT)
  })

  it('takes near black only once it reads at 4.5:1', () => {
    expect((nearBlackFrom + 0.05) / (nearBlack + 0.05)).toBeGreaterThanOrEqual(
      TEXT,
    )
  })

  it('falls back on plain black in between, which reads at 4.5:1', () => {
    expect((whiteUpTo + 0.05) / 0.05).toBeGreaterThanOrEqual(TEXT)
  })
})
