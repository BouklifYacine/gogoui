import type { ReactNode } from 'react'

import type { GoGoUIMessages } from '../i18n/messages.ts'
import { MessagesContext, useGoGoUIMessages } from '../i18n/messages-context.ts'

/**
 * Hands a component's `labels` to every GoGoUI part drawn inside it, for
 * a component whose parts are drawn by a library (a calendar's days, a
 * tour's tooltip) or sit deep inside (a data table's pagination).
 *
 * @summary Internal: a component's own words, for every part inside it.
 */
export function LabelsScope({
  labels,
  children,
}: {
  labels?: Partial<GoGoUIMessages>
  children: ReactNode
}) {
  const words = useGoGoUIMessages(labels)
  return <MessagesContext value={words}>{children}</MessagesContext>
}
