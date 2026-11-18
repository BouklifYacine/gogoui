import type * as React from 'react'
import {
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
} from '@phosphor-icons/react'
import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'

/**
 * Pages of a long list: « Précédent », the page numbers, « Suivant ». The
 * pages are buttons, not links: a page changes the list's state, which the
 * screen may keep in the address. Compose it: `Pagination` >
 * `PaginationContent` > `PaginationItem`s holding a `PaginationPrevious`,
 * `PaginationButton`s, a `PaginationEllipsis`, a `PaginationNext`.
 *
 * @summary Move between the pages of a long list.
 */
function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  const { pages } = useGoGoUIMessages()
  return (
    <nav
      aria-label={pages}
      data-slot="pagination"
      className={cn('flex', className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationButtonProps = {
  isActive?: boolean
} & React.ComponentProps<typeof Button>

/** One page's button; the current one is outlined and said to be current. */
function PaginationButton({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn('tabular-nums', className)}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationButton>) {
  const { previous } = useGoGoUIMessages()
  return (
    <PaginationButton
      size="default"
      className={cn('border-border', className)}
      variant="outline"
      {...props}
    >
      <CaretLeftIcon aria-hidden="true" data-icon="inline-start" />
      {previous}
    </PaginationButton>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationButton>) {
  const { next } = useGoGoUIMessages()
  return (
    <PaginationButton
      size="default"
      className={cn('border-border', className)}
      variant="outline"
      {...props}
    >
      {next}
      <CaretRightIcon aria-hidden="true" data-icon="inline-end" />
    </PaginationButton>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn(
        'flex size-11 items-center justify-center text-muted-foreground',
        className,
      )}
      {...props}
    >
      <DotsThreeIcon className="size-3.5" />
    </span>
  )
}

export {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
}
