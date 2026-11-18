import type { ReactNode } from 'react'

import { cn } from '../lib/cn.ts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog.tsx'

type SettingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  /** The form: fields, then a `SettingDialogFooter`. Mounted while open. */
  children: ReactNode
  /** Wider for several texts (« sm:max-w-lg »). */
  className?: string
}

/**
 * The dialog that changes one setting or a few related ones, opened by a
 * row's « Modifier ». Its form starts from the saved values at each
 * opening (the children mount with it); close it once saved. Taller than
 * the screen, it scrolls inside.
 *
 * @summary The dialog that changes a setting.
 */
function SettingDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: SettingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[calc(100dvh-2rem)] overflow-y-auto text-base',
          className,
        )}
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-medium">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {open && children}
      </DialogContent>
    </Dialog>
  )
}

export { SettingDialog }
export type { SettingDialogProps }
