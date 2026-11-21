import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { GoGoIcon } from '../internal/gogo-icon.tsx'
import { cn } from '../lib/cn.ts'

/**
 * The path to the current page, each step a link back.
 *
 * **Use it for** pages two levels deep or more (Paramètres › Équipe ›
 * Marie). **Not for** a flat app; one step back is a `BackLink`.
 *
 * **Where**: top of the page, above its title.
 *
 * **Compose**: `Breadcrumb` > `BreadcrumbList` > `BreadcrumbItem`s with
 * `BreadcrumbLink` (or `BreadcrumbPage` for the current one) and
 * `BreadcrumbSeparator`; `BreadcrumbEllipsis` hides middle steps.
 *
 * **Accessibility**: a `nav` named « Fil d'Ariane »; the current page has
 * `aria-current="page"`.
 *
 * @summary The path to the current page, each step a link back.
 */
function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  const { breadcrumb } = useGoGoUIMessages()
  return (
    <nav
      aria-label={breadcrumb}
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        className: cn('transition-colors hover:text-foreground', className),
      },
      props,
    ),
    render,
    state: {
      slot: 'breadcrumb-link',
    },
  })
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <GoGoIcon name="chevronRight" aria-hidden="true" />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  const { more } = useGoGoUIMessages()
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'flex size-5 items-center justify-center [&>svg]:size-3.5',
        className,
      )}
      {...props}
    >
      <GoGoIcon name="more" aria-hidden="true" />
      <span className="sr-only">{more}</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
