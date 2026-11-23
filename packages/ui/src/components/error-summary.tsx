import { WarningCircleIcon } from '@phosphor-icons/react'
import type { Ref } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'

type ErrorSummaryProps = {
  /** Each error, with the id of the field it is about. */
  errors: readonly { fieldId: string; message: string }[]
  id?: string
  className?: string
  /** Focus it after a refused submit, so a screen reader reads the list. */
  ref?: Ref<HTMLDivElement>
}

/** Puts the focus on a field by its id, as Tab would on a radio group. */
function focusField(fieldId: string) {
  const element = document.getElementById(fieldId)
  // A radio group takes no focus itself: its checked option, or the first.
  const target =
    element?.getAttribute('role') === 'radiogroup'
      ? (element.querySelector<HTMLElement>(
          '[role=radio][aria-checked=true]',
        ) ?? element.querySelector<HTMLElement>('[role=radio]'))
      : element
  target?.focus()
}

/**
 * Every error of a long form, each a link to its field.
 *
 * **Use it for** forms longer than a screen, after a failed submit.
 *
 * **Where**: at the top of the form; it takes the focus when it shows.
 *
 * **Key props**: `errors` (`{ fieldId, message }[]`, the `id` of each
 * field).
 *
 * **Accessibility**: `role="alert"`, focused, each link moves to its field.
 *
 * @summary Every error of a long form, each leading to its field.
 */
function ErrorSummary({
  errors,
  id = 'error-summary',
  className,
  ref,
}: ErrorSummaryProps) {
  const { errorCount } = useGoGoUIMessages()
  if (errors.length === 0) {
    return null
  }

  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      data-slot="error-summary"
      aria-labelledby={`${id}-title`}
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-danger-line bg-danger-subtle p-4 text-danger-fg outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus',
        className,
      )}
    >
      <p id={`${id}-title`} className="flex items-center gap-2 font-medium">
        <WarningCircleIcon aria-hidden="true" className="size-4.5" />
        {errorCount(errors.length)}
      </p>
      <ul className="flex flex-col gap-1">
        {errors.map(({ fieldId, message }) => (
          <li key={fieldId}>
            <a
              href={`#${fieldId}`}
              className="underline underline-offset-4"
              onClick={(event) => {
                event.preventDefault()
                focusField(fieldId)
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { ErrorSummary, focusField }
export type { ErrorSummaryProps }
