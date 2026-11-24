import type { VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn.ts'

import { buttonVariants } from './button.tsx'

// A slow breath, once a second; reduced motion stills it.
const pulse = 'animate-[pulse_1s_ease-in-out_infinite] bg-line-strong'

/**
 * Grey shapes the size of content that is loading.
 *
 * **Use it for** the first load of a page, a card, a list, so nothing
 * jumps. **Prefer** the ready ones (`PageHeaderSkeleton`,
 * `DataTableSkeleton`, `FieldSkeleton`…); `Spinner` for an action.
 *
 * **Where**: exactly where the content will be, at its size.
 *
 * **Key props**: size through `className` (`h-4 w-32`); `SkeletonText`,
 * `SkeletonButton`, `SkeletonBadge` for the usual shapes.
 *
 * **Accessibility**: hidden from screen readers; say « Chargement » once on
 * the region (`aria-busy`).
 *
 * @summary Grey placeholders the size of the content being loaded.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(pulse, 'rounded-md', className)}
      {...props}
    />
  )
}

/**
 * Text in grey: the words are there but unseen, so each bar takes the size
 * a real line would, wraps where it would, and the page keeps its height
 * when the real text comes. Give it a sample as long as the usual value.
 */
function SkeletonText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="skeleton"
      aria-hidden
      className={cn(
        pulse,
        'rounded-sm box-decoration-clone text-transparent select-none',
        className,
      )}
      {...props}
    />
  )
}

/** A button in grey, as wide and tall as the button with this label. */
function SkeletonButton({
  size,
  icon,
  className,
  children,
}: VariantProps<typeof buttonVariants> & {
  /** Room for the button's icon before its label. */
  icon?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        buttonVariants({ variant: 'ghost', size }),
        pulse,
        'text-transparent',
        className,
      )}
    >
      {icon && <span className="size-3.5" />}
      {children}
    </div>
  )
}

/** A badge in grey: « Nouvelle », « En retard ». */
function SkeletonBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="skeleton"
      aria-hidden
      className={cn(
        pulse,
        'inline-flex min-h-6 w-fit shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap text-transparent',
      )}
    >
      {children}
    </span>
  )
}

export { Skeleton, SkeletonBadge, SkeletonButton, SkeletonText }
