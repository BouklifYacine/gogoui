import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { CopyButton } from './copy-button.tsx'
import { Field, FieldDescription, FieldLabel } from './field.tsx'
import { Input } from './input.tsx'

type CopyLinkFieldProps = {
  id: string
  label: string
  /** The link, key, address or code to copy. */
  value: string
  /** Where to paste it, and who may have it. */
  description: ReactNode
  /** The button's words, « Copier le lien » by default. */
  copyLabel?: string
  /** Read once copied, « Lien copié. » by default. */
  copiedMessage?: string
}

/**
 * A link (or a key, an address, a code), read-only, with a button that
 * copies it. The copy is announced. When the browser refuses the
 * clipboard, the text is selected in the field and the page says to copy
 * it by hand.
 *
 * @summary A read-only link with its copy button.
 */
function CopyLinkField({
  id,
  label,
  value,
  description,
  copyLabel,
  copiedMessage,
}: CopyLinkFieldProps) {
  const messages = useGoGoUIMessages()
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const input = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function said(copied: boolean) {
    clearTimeout(timer.current)
    setState(copied ? 'copied' : 'failed')
    // Emptied with the button's « Copié », so a second copy is read again.
    if (copied) {
      timer.current = setTimeout(() => setState('idle'), 3000)
    } else {
      input.current?.focus()
      input.current?.select()
    }
  }

  return (
    <Field data-slot="copy-link-field">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          ref={input}
          id={id}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          aria-describedby={`${id}-hint`}
        />
        <CopyButton
          text={value}
          label={copyLabel ?? messages.copyLink}
          onResult={said}
        />
      </div>
      {/* Always in the page: a live region added later is not read. */}
      <p
        role="status"
        className={state === 'failed' ? 'text-sm text-danger-fg' : 'sr-only'}
      >
        {state === 'copied' && (copiedMessage ?? messages.linkCopied)}
        {state === 'failed' && messages.copyByHand}
      </p>
      <FieldDescription id={`${id}-hint`}>{description}</FieldDescription>
    </Field>
  )
}

export { CopyLinkField }
export type { CopyLinkFieldProps }
