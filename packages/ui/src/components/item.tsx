import type { ComponentProps } from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn.ts'

const itemVariants = cva(
  'group/item flex w-full flex-wrap items-center gap-4 rounded-xl text-sm text-fg outline-none transition-colors [a]:hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-line',
        muted: 'bg-tray',
      },
      size: {
        default: 'p-4',
        sm: 'gap-3 px-3 py-2',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ItemProps = useRender.ComponentProps<'div'> &
  VariantProps<typeof itemVariants>

/**
 * A list line with its media, words and actions.
 *
 * **Use it for** a short list that is not a table: team members, files,
 * integrations, notifications. **Prefer** `DataTable` for records to sort
 * and filter.
 *
 * **Where**: stacked in a card or a section, in an `ItemGroup`.
 *
 * **States**: default, hover when it is a link (`render={<a />}`), with
 * actions on the right.
 *
 * **Key props**: `variant` (default, outline, muted), `size` (default, sm),
 * `render` (a link to the record).
 *
 * **Compose**: `Item` > `ItemMedia` + `ItemContent` (`ItemTitle`,
 * `ItemDescription`) + `ItemActions`.
 *
 * **Accessibility**: one link per line at most; buttons inside need names.
 *
 * @summary A list line with its media, words and actions.
 */
function Item({ className, variant, size, render, ...props }: ItemProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      { className: cn(itemVariants({ variant, size }), className) },
      props,
    ),
    render,
    state: { slot: 'item', variant, size },
  })
}

function ItemGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  )
}

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'div'> & { variant?: 'default' | 'icon' | 'image' }) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(
        'flex shrink-0 items-center justify-center',
        variant === 'icon' &&
          'size-9 rounded-lg bg-tray text-fg-muted [&_svg]:size-4.5',
        variant === 'image' &&
          'size-10 overflow-hidden rounded-lg [&_img]:size-full [&_img]:object-cover',
        className,
      )}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn('font-medium text-fg', className)}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn('line-clamp-2 text-fg-muted', className)}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex shrink-0 items-center gap-2', className)}
      {...props}
    />
  )
}

export {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  itemVariants,
}
export type { ItemProps }
