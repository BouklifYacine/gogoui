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
 * The title of a page reached by navigation. A single-page app does not
 * reload, so a screen reader would not notice the new page: the heading
 * takes the focus when it appears and is read aloud. Focusable by script
 * only, never by Tab.
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
        'text-2xl font-medium tracking-title text-fg outline-none sm:text-3xl',
        className,
      )}
    >
      {children}
    </Heading>
  )
}

export { PageHeading }
export type { PageHeadingProps }
