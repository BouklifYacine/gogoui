import type { ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'

import { FieldMessageRow } from './field-message-row.tsx'

/**
 * A field's help or error that slides in when it appears and out when it
 * goes, after Arc UI (https://uiarc.dev, MIT). Nothing moves on the first
 * render: a message already there at load is simply there.
 *
 * No `role="alert"`: a form that re-checks at each key would interrupt
 * the screen reader at every letter. The field points at the message with
 * `aria-describedby`, so it is read with the field.
 *
 * @summary Internal: the sliding help or error under a field.
 */
export function FieldMessage({
  id,
  tone,
  slot,
  children,
}: {
  id: string
  tone: 'muted' | 'danger'
  slot: string
  children: ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <FieldMessageRow key="message" id={id} tone={tone} slot={slot}>
          {children}
        </FieldMessageRow>
      ) : null}
    </AnimatePresence>
  )
}
