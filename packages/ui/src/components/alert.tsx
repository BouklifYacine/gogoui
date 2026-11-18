import type { ComponentProps, ReactNode } from 'react'
import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn.ts'

const alertVariants = cva(
  'grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 rounded-lg border px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4.5',
  {
    variants: {
      variant: {
        neutral: 'border-line bg-tray text-fg [&>svg]:text-fg-muted',
        info: 'border-info-line bg-info-subtle text-info-fg',
        success: 'border-success-line bg-success-subtle text-success-fg',
        warning: 'border-warning-line bg-warning-subtle text-warning-fg',
        danger: 'border-danger-line bg-danger-subtle text-danger-fg',
      },
    },
    defaultVariants: { variant: 'info' },
  },
)

const icons = {
  neutral: InfoIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
} as const

type AlertProps = ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    /** Its own icon; null for none. The variant's by default. */
    icon?: ReactNode
    /** A button or a link on the right (« Réessayer »). */
    action?: ReactNode
  }

/**
 * A message in the page: something to know (info), done (success), to
 * watch (warning) or that failed (danger), told by its words and an icon,
 * never by its colour alone. Static by default; give `role="alert"` to
 * one that appears after an action so it is read aloud. Compose its words
 * with `AlertTitle` and `AlertDescription`.
 *
 * @summary A message in the page: info, success, warning or failure.
 */
function Alert({
  className,
  variant = 'info',
  icon,
  action,
  children,
  ...props
}: AlertProps) {
  const Icon = icons[variant ?? 'info']
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon === undefined ? <Icon aria-hidden="true" weight="fill" /> : icon}
      <div className="col-start-2 flex min-w-0 flex-col gap-1">{children}</div>
      {action && (
        <div className="col-start-2 mt-1 flex flex-wrap gap-2">{action}</div>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-title"
      className={cn('font-medium', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('opacity-90 [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
export type { AlertProps }
