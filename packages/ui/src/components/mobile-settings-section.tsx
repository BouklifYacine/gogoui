import { useState } from 'react'
import type { ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'

import { useIsMobile } from '../internal/use-is-mobile.ts'
import { cn } from '../lib/cn.ts'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible.tsx'

type MobileSettingsSectionProps = {
  title: string
  /** What is set, in a line under the title while folded. */
  summary?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  /** Raise it at a refused submit: the section opens on its errors. */
  reveal?: number
  /** No card around it on a phone. */
  plain?: boolean
}

/**
 * A long settings form folded by part on a phone.
 *
 * **Use it for** a settings page with many fields: each part a card that
 * opens on a tap. From 768 px it is always open.
 *
 * **Key props**: `title`, `summary` (what is set, under the title while
 * folded), `defaultOpen`, `reveal` (raise it at a refused submit: the part
 * opens on its errors), `plain` (no card).
 *
 * @summary A settings part folded on a phone.
 */
function MobileSettingsSection({
  title,
  summary,
  children,
  defaultOpen = false,
  reveal = 0,
  plain = false,
}: MobileSettingsSectionProps) {
  const mobile = useIsMobile()
  const [open, setOpen] = useState(defaultOpen)
  const [lastReveal, setLastReveal] = useState(reveal)
  if (reveal !== lastReveal) {
    setLastReveal(reveal)
    setOpen(true)
  }

  return (
    <Collapsible
      open={!mobile || open}
      onOpenChange={setOpen}
      className={cn(
        'min-w-0 md:contents',
        !plain &&
          'max-md:rounded-xl max-md:border max-md:border-line max-md:bg-card',
      )}
    >
      <CollapsibleTrigger className="group flex min-h-14 w-full items-center gap-3 rounded-xl px-4 py-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus md:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-fg">{title}</span>
          {summary && (
            <span className="mt-0.5 block text-sm wrap-anywhere text-fg-muted">
              {summary}
            </span>
          )}
        </span>
        <CaretDownIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-fg-subtle group-data-[panel-open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        keepMounted
        className={cn(
          'flex flex-col data-[closed]:hidden md:contents',
          plain ? 'gap-0' : 'gap-4',
          !plain && 'max-md:border-t max-md:border-line max-md:p-4',
        )}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export { MobileSettingsSection }
export type { MobileSettingsSectionProps }
