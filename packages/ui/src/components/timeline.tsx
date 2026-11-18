import type { ReactNode } from 'react'

import { subtle } from '../internal/colors.ts'
import type { Color } from '../internal/colors.ts'
import { cn } from '../lib/cn.ts'

type TimelineEvent = {
  /** Unique in the list. */
  id: string
  /** What happened: « Devis envoyé ». */
  title: ReactNode
  /** When, in words: « il y a 2 h », « 12 juin à 14:30 ». */
  time: ReactNode
  /** The machine-readable moment, for `<time dateTime>`. */
  dateTime?: string
  /** More words under it: who, how much. */
  description?: ReactNode
  /** An icon in the event's dot. */
  icon?: ReactNode
  /** The dot's tint; grey by default. */
  color?: Color
}

type TimelineProps = {
  events: readonly TimelineEvent[]
  className?: string
}

/**
 * What happened to a record, one event under the other along a line: a
 * request received, a visit, a quote sent. A list for screen readers, each
 * moment a `<time>`. Newest first or last, as you give them.
 *
 * @summary A record's history along a line.
 */
function Timeline({ events, className }: TimelineProps) {
  return (
    <ol data-slot="timeline" className={cn('flex flex-col', className)}>
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
          {index < events.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-8 bottom-0 left-4 w-px -translate-x-1/2 bg-line"
            />
          )}
          <span
            aria-hidden="true"
            className={cn(
              'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-tray text-fg-muted [&_svg]:size-4',
              event.color && subtle[event.color],
            )}
          >
            {event.icon ?? <span className="size-2 rounded-full bg-current" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="font-medium text-fg">{event.title}</p>
              <time
                dateTime={event.dateTime}
                className="text-sm text-fg-subtle tabular-nums"
              >
                {event.time}
              </time>
            </div>
            {event.description && (
              <div className="text-sm text-fg-muted">{event.description}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

export { Timeline }
export type { TimelineEvent, TimelineProps }
