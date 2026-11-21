import type { ReactNode } from 'react'

type DetailsListProps = {
  /** [what, its value]: « Date souhaitée », « samedi 12 juin 2027 ». */
  rows: [string, ReactNode][]
}

/**
 * A record's labels and values.
 *
 * **Use it for** what a record holds: date, guests, budget, contact.
 * **Not for** values to edit in place (`SettingValueRow`).
 *
 * **Where**: in a card or a `TitledSection`.
 *
 * **Key props**: `rows` (`[label, value][]`). Side by side when its block is
 * wide, stacked when narrow.
 *
 * **Accessibility**: a description list (`dl`).
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
