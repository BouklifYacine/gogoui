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
 * Back to a page's list: an arrow and the list's name, cut when too long.
 * A link by default; give your router's link with `render`
 * (`render={<Link to="/clients" />}`), or a button calling
 * `history.back()` to return to the list as it was left.
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
