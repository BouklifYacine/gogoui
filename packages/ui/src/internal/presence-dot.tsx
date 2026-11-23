import { cn } from '../lib/cn.ts'

/** A person's presence. */
export type Presence = 'available' | 'busy' | 'away'

/**
 * A presence mark, after Arc UI (https://uiarc.dev, MIT): one shape per
 * state as well as one colour, so the colour never says it alone: full
 * when available, barred when busy, hollow when away. The ring takes the
 * surface it sits on through `className` (`ring-surface`, `ring-floating`).
 *
 * @summary Internal: UserMenu's presence dot.
 */
export function PresenceDot({
  status,
  className,
}: {
  status: Presence
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      data-status={status}
      className={cn(
        'relative inline-block size-2.5 shrink-0 rounded-full ring-2 transition-colors duration-200 ease-standard motion-reduce:transition-none',
        "before:absolute before:inset-0 before:m-auto before:size-[46%] before:scale-0 before:rounded-full before:bg-floating before:content-['']",
        "after:absolute after:inset-0 after:m-auto after:h-[22%] after:min-h-[1.5px] after:w-[58%] after:scale-x-0 after:rounded-[1px] after:bg-floating after:content-['']",
        status === 'available' && 'bg-success',
        status === 'busy' && 'bg-danger after:scale-x-100',
        status === 'away' && 'bg-warning before:scale-100',
        className,
      )}
    />
  )
}
