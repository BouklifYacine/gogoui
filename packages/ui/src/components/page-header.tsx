import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'
import { PageHeading } from './page-heading.tsx'

type PageHeaderProps = {
  title: string
  /** One sentence: what the page is for. */
  description?: ReactNode
  /** The page's buttons, on the right; on a phone beside the title when they fit, under it otherwise. */
  actions?: ReactNode
  /** The `data-guide` a GuidedTour step points at, on the title and its sentence. */
  guide?: string
  /** False: the sentence is left out under 768px, where the title alone says enough. */
  descriptionOnPhone?: boolean
}

/**
 * A page's title, its sentence and its buttons.
 *
 * **Use it for** the top of every app page.
 *
 * **Where**: first in the page, above everything; buttons on the right,
 * beside the title on a phone when they fit, under it otherwise.
 *
 * **Key props**: `title` (an h1, read when the page opens), `description`
 * (one sentence: what the page is for), `actions` (the page's main button
 * first, `default` variant, others `outline`), `guide` (a GuidedTour
 * step's target), `descriptionOnPhone`.
 *
 * @summary A page's title, sentence and buttons.
 */
function PageHeader({
  title,
  description,
  actions,
  guide,
  descriptionOnPhone = true,
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className="flex gap-4 max-sm:flex-wrap max-sm:items-center max-sm:justify-between sm:items-start sm:justify-between"
    >
      <div data-guide={guide} className="flex flex-col gap-2">
        <PageHeading>{title}</PageHeading>
        {description && (
          <p
            className={cn(
              'text-fg-muted',
              !descriptionOnPhone && 'max-md:hidden',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  )
}

export { PageHeader }
export type { PageHeaderProps }
