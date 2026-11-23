import { cn } from '../lib/cn.ts'
import { CHECKER } from './color-picker-context.ts'

/**
 * A round sample of a colour over a checkerboard, so its opacity shows.
 *
 * @summary Internal: ColorPicker's colour sample.
 */
export function ColorChip({
  color,
  className,
}: {
  color: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block size-8 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      style={{ background: CHECKER }}
    >
      <span
        className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_var(--line)]"
        style={{ background: color }}
      />
    </span>
  )
}
