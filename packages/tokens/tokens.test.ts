import { describe, expect, it } from 'bun:test'

/*
 * WCAG AA, checked on the tokens themselves: a token that drifts below its
 * contrast fails here before any screen ships it. 4.5:1 for text, 3:1 for
 * the edge of a control (WCAG 1.4.11).
 */

const css = await Bun.file(new URL('./tokens.css', import.meta.url)).text()

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector)
  const open = css.indexOf('{', start)
  const close = css.indexOf('\n}', open)
  const body = css.slice(open + 1, close)
  const values: Record<string, string> = {}
  for (const match of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    values[match[1] as string] = (match[2] as string).toLowerCase()
  }
  return values
}

const light = block(':root,\n:where(.light) {')
const dark = block('\n.dark {')

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((at) => {
    const value = Number.parseInt(hex.slice(at, at + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const [r = 0, g = 0, b = 0] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
}

function ratio(theme: Record<string, string>, fg: string, bg: string): number {
  const a = theme[fg]
  const b = theme[bg]
  if (!a || !b) throw new Error(`missing hex token: ${fg} or ${bg}`)
  return contrast(a, b)
}

const TEXT = 4.5
const EDGE = 3

describe('light theme', () => {
  it.each([
    ['fg', 'surface'],
    ['fg-muted', 'surface'],
    ['fg-subtle', 'surface'],
    ['fg-subtle', 'canvas'],
    ['destructive', 'surface'],
    ['primary-foreground', 'primary'],
    ['danger-foreground', 'danger'],
    ['danger-fg', 'danger-subtle'],
    ['warning-fg', 'warning-subtle'],
    ['success-fg', 'success-subtle'],
    ['info-fg', 'info-subtle'],
    ['highlight-fg', 'highlight-subtle'],
    ['caution-fg', 'caution-subtle'],
    ['neutral-fg', 'neutral-subtle'],
  ])('%s on %s reads at 4.5:1', (fg, bg) => {
    expect(ratio(light, fg, bg)).toBeGreaterThanOrEqual(TEXT)
  })

  it('draws the edge of a field at 3:1 on white and on the canvas', () => {
    expect(ratio(light, 'field-line', 'surface')).toBeGreaterThanOrEqual(EDGE)
    expect(ratio(light, 'field-line', 'canvas')).toBeGreaterThanOrEqual(EDGE)
  })
})

describe('dark theme', () => {
  it.each([
    ['fg', 'floating'],
    ['fg-muted', 'floating'],
    ['fg-subtle', 'floating'],
    ['destructive', 'surface'],
    ['primary-foreground', 'primary'],
  ])('%s on %s reads at 4.5:1', (fg, bg) => {
    expect(ratio(dark, fg, bg)).toBeGreaterThanOrEqual(TEXT)
  })

  it('draws the edge of a field at 3:1 on a card', () => {
    expect(ratio(dark, 'field-line', 'surface')).toBeGreaterThanOrEqual(EDGE)
  })
})
