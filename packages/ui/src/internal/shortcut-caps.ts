// The key caps of ShortcutKeys and ShortcutRecorder: Kbd at two sizes, lit
// in a colour while held. Every class is written out in full, so Tailwind
// finds them.
import type { Color } from './colors.ts'

/** A cap's size: 22px or 26px, after Arc UI. */
export const capSize = {
  sm: 'h-5.5 min-w-5.5 rounded-[7px] px-1.25',
  default: 'h-6.5 min-w-6.5 rounded-lg px-1.75',
} as const

/** A held cap in a colour (Kbd lights it in primary on its own). */
export const capPressed: Record<Color, string> = {
  neutral:
    'data-pressed:border-neutral-line data-pressed:bg-neutral-subtle data-pressed:text-neutral-fg',
  primary:
    'data-pressed:border-primary-subtle-stronger data-pressed:bg-primary-subtle data-pressed:text-primary-active',
  info: 'data-pressed:border-info-line data-pressed:bg-info-subtle data-pressed:text-info-fg',
  success:
    'data-pressed:border-success-line data-pressed:bg-success-subtle data-pressed:text-success-fg',
  warning:
    'data-pressed:border-warning-line data-pressed:bg-warning-subtle data-pressed:text-warning-fg',
  danger:
    'data-pressed:border-danger-line data-pressed:bg-danger-subtle data-pressed:text-danger-fg',
}
