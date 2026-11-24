import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'

type PageHeadingProps = {
  children: ReactNode
  className?: string
  /**
   * 1 for a page's title; 2 for a part of a page that swaps its content (a
   * form giving way to its confirmation): one h1 per page.
   */
  level?: 1 | 2
}

// A callback ref outside the component: it runs once, when the heading
// appears, not on every render.
function focusWhenShown(heading: HTMLHeadingElement | null) {
  heading?.focus()
}

/**
 * A page's title, focused and read aloud when the page opens.
 *
 * **Use it for** a page that has no `PageHeader` (a sign-in, a wizard
 * step); `PageHeader` already uses it.
 *
 * **Key props**: `level` (1 or 2), children.
 *
 * **Accessibility**: in a single-page app the change of page is otherwise
 * silent; this title says it.
 *
 * @summary A page's title, read aloud when the page opens.
 */
function PageHeading({ children, className, level = 1 }: PageHeadingProps) {
  const Heading = level === 2 ? 'h2' : 'h1'

  return (
    <Heading
      ref={focusWhenShown}
      tabIndex={-1}
      data-slot="page-heading"
      className={cn(
        // No colour of its own: it reads its parent's, so a title on a dark
        // header or a photo stays legible.
        'text-2xl font-medium tracking-title outline-none sm:text-3xl',
        className,
      )}
    >
      {children}
    </Heading>
  )
}

export { PageHeading }
export type { PageHeadingProps }
