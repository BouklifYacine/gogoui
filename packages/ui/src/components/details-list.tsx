import type { ReactNode } from 'react'

type DetailsListProps = {
  /** [what, its value]: « Date souhaitée », « samedi 12 juin 2027 ». */
  rows: [string, ReactNode][]
}

/**
 * What a record holds, as label and value, a thin line between rows. Side
 * by side when its block is wide enough, one under the other in a narrow
 * one: it reads its own width, not the screen's. A long value wraps. A
 * description list for screen readers.
 *
 * @summary A record's labels and values.
 */
function DetailsList({ rows }: DetailsListProps) {
  return (
    <div data-slot="details-list" className="@container">
      <dl className="divide-y divide-line">
        {rows.map(([term, value]) => (
          <div
            key={term}
            className="grid gap-x-6 gap-y-0.5 py-2 first:pt-0 last:pb-0 @sm:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <dt className="text-fg-muted">{term}</dt>
            <dd className="min-w-0 break-words text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export { DetailsList }
export type { DetailsListProps }
