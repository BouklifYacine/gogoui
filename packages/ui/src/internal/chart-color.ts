import { text } from './colors.ts'
import type { Color } from './colors.ts'

/**
 * A chart's colour: one of GoGoUI's six colours (primary, success…) or a
 * series slot of the chart palette, `chart-1` to `chart-5`.
 */
export type ChartColor =
  Color | 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'

/** The CSS colour of a chart colour, for a fill, a stroke or a custom property. */
export function chartColor(color: ChartColor): string {
  return `var(--${color})`
}

/** The palette slot of the nth series: --chart-1 to --chart-5, then again. */
export function seriesColor(index: number): string {
  return `var(--chart-${(index % 5) + 1})`
}

/**
 * Words in a chart colour, readable on the page (4.5:1): the colour's own
 * text shade, or the plain text colour for a palette slot.
 */
export function chartTextColor(color: ChartColor): string {
  return color.startsWith('chart-') ? 'text-fg' : text[color as Color]
}
