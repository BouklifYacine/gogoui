import type { ReactNode } from 'react'

import { PageHeading } from './page-heading.tsx'

type PageHeaderProps = {
  title: string
  /** One sentence: what the page is for. */
  description?: ReactNode
  /** The page's buttons, on the right (under the title on a phone). */
  actions?: ReactNode
}

/**
 * A page's header: its title and its sentence on the left, its buttons on
 * the right, under them on a phone. The title is read aloud when the page
 * opens (`PageHeading`).
 *
 * @summary A page's title, sentence and buttons.
 */
function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex flex-col gap-2">
        <PageHeading>{title}</PageHeading>
        {description && <p className="text-fg-muted">{description}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  )
}

export { PageHeader }
export type { PageHeaderProps }
