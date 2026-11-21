import { ArrowLeftIcon } from '@phosphor-icons/react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'

import { cn } from '../lib/cn.ts'
import { buttonVariants } from './button.tsx'

type BackLinkProps = useRender.ComponentProps<'a'> & {
  /** Where it leads: « Clients ». */
  label: string
}

/**
 * The way back to a page's list.
 *
 * **Use it for** a record's page opened from a list (a client, a quote).
 *
 * **Where**: top left of the page, above its title.
 *
 * **Key props**: `label` (the list's name: « Clients »), `href`, or
 * `render` to use your router's link or a `history.back()` button.
 *
 * **Accessibility**: a real link, read as « Clients »; the arrow is hidden.
 *
 * @summary The way back to a page's list.
 */
function BackLink({ label, className, render, ...props }: BackLinkProps) {
  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        className: cn(
          buttonVariants({ variant: 'link' }),
          'w-fit max-w-full min-w-0 px-0',
          className,
        ),
        children: (
          <>
            <ArrowLeftIcon aria-hidden="true" />
            <span className="truncate">{label}</span>
          </>
        ),
      },
      props,
    ),
    render,
    state: { slot: 'back-link' },
  })
}

export { BackLink }
export type { BackLinkProps }
