import { describe, expect, it } from 'vitest'

import { contrast, parseHex, toOklch } from './color.ts'
import type { Rgb } from './color.ts'
import { createTheme } from './create-theme.ts'

const hex = (text: string) => parseHex(text) as Rgb

describe('createTheme', () => {
  it('writes white on a dark brand and reports the contrast', () => {
    const theme = createTheme('#1a66fe')
    expect(theme.light).toEqual({
      brand: '#1a66fe',
      foreground: '#ffffff',
      contrast: 4.79,
      readable: true,
    })
  })

  it('writes near black on a light brand', () => {
    const theme = createTheme('#fbbf24')
    expect(theme.light.foreground).toBe('#0a0a0a')
    expect(theme.light.contrast).toBeGreaterThanOrEqual(4.5)
  })

  it('falls back on plain black where near black falls just short', () => {
    // Luminance 0.186: white reads at 4.4:1, near black at 4.45:1.
    const theme = createTheme('#767676')
    expect(theme.light.foreground).toBe('#ffffff')
    const between = createTheme('#787878')
    expect(between.light.foreground).toBe('#000000')
    expect(between.light.readable).toBe(true)
  })

  it('reaches 4.5:1 for any colour', () => {
    for (let value = 0; value < 0x1000000; value += 0x00f3a7) {
      const color = `#${value.toString(16).padStart(6, '0')}`
      const theme = createTheme(color)
      expect(theme.light.readable, color).toBe(true)
      expect(theme.dark.readable, color).toBe(true)
    }
  })

  it('lifts a dark brand for the dark theme, keeping its hue', () => {
    const theme = createTheme('#1e3a8a')
    const before = toOklch(hex('#1e3a8a'))
    const after = toOklch(hex(theme.dark.brand))
    expect(after.l).toBeCloseTo(0.72, 2)
    expect(after.h).toBeCloseTo(before.h, 0)
    // Visible on the black page.
    expect(contrast(hex(theme.dark.brand), hex('#000000'))).toBeGreaterThan(3)
  })

  it('keeps a light brand as it is at night', () => {
    expect(createTheme('#fbbf24').dark.brand).toBe('#fbbf24')
  })

  it('returns the light and dark blocks', () => {
    expect(createTheme('#fbbf24').css).toBe(
      [
        ':root,',
        ':where(.light) {',
        '  --brand: #fbbf24;',
        '  --brand-foreground: #0a0a0a;',
        '}',
        '',
        '.dark {',
        '  --brand: #fbbf24;',
        '  --brand-foreground: #0a0a0a;',
        '}',
        '',
      ].join('\n'),
    )
  })

  it('reads the short hex and upper case', () => {
    expect(createTheme('#FFF').light.brand).toBe('#ffffff')
  })

  it('refuses what is not a hex colour', () => {
    expect(() => createTheme('blue')).toThrow(/not a hex colour/)
  })
})
