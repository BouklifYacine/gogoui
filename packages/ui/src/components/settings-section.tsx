import { useState } from 'react'
import type { ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'

import { cn } from '../lib/cn.ts'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible.tsx'

type SettingsSectionProps = {
  title: string
  /** What is set, in a line under the title while folded. */
  summary?: ReactNode
  children: ReactNode
  /** Open on a phone from the start. */
  defaultOpen?: boolean
  /** Raise it at a refused submit: the section opens on its errors. */
  reveal?: number
  /** No card around it on a phone. */
  plain?: boolean
}

/**
 * A part of a long settings form: folded into a card on a phone, laid out
 * with the rest of the form from 48rem.
 *
 * **Use it for** a settings page with many fields, split into parts
 * (Coordonnées, Facturation, Page publique).
 *
 * **Where**: inside the form, one per part; from 48rem its fields join the
 * form's own layout (`display: contents`), as if it were not there.
 *
 * **States**: on a phone folded (the title and what is set), open (the
 * fields under a line); from 48rem always open, whatever its state.
 *
 * **On a phone** (under 48rem): a card with a 56 px line that opens on a
 * tap. The screen's width decides in CSS (`max-md:` / `md:`), so the
 * server's page is already folded on a phone and open on a computer.
 *
 * **Key props**: `title`, `summary` (what is set, under the title while
 * folded), `defaultOpen`, `reveal` (raise it at a refused submit: the part
 * opens on its errors), `plain` (no card).
 *
 * **Accessibility**: on a phone the line is a button with `aria-expanded`;
 * a folded part is `display: none`, never read nor focused. From 48rem
 * there is no button, only the fields.
 *
 * @summary A settings part folded on a phone.
 */
function SettingsSection({
  title,
  summary,
  children,
  defaultOpen = false,
  reveal = 0,
  plain = false,
}: SettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [lastReveal, setLastReveal] = useState(reveal)
  if (reveal !== lastReveal) {
    setLastReveal(reveal)
    setOpen(true)
  }

  return (
    <Collapsible
      open={open}
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
        // Folded, it hides on a phone only (the class below), never with
        // the `hidden` attribute, which no breakpoint could undo.
        hidden={false}
        className={cn(
          'flex flex-col max-md:data-[closed]:hidden md:contents',
          plain ? 'gap-0' : 'gap-4',
          !plain && 'max-md:border-t max-md:border-line max-md:p-4',
        )}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export { SettingsSection }
export type { SettingsSectionProps }
