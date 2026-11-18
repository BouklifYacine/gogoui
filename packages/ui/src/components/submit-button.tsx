import type { ComponentProps, ReactNode } from 'react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { MorphingButton } from '../internal/morphing-button.tsx'
import { Button } from './button.tsx'

type SubmitButtonProps = {
  children: ReactNode
  /** True while the form submits: the button spins and says it. */
  submitting: boolean
  /** On the button while it submits (« Enregistrement… »). */
  loadingText: string
  variant?: ComponentProps<typeof Button>['variant']
  /**
   * True once the save went through (your request's own success). Given,
   * the button closes into a spinner, then opens into a green « Enregistré ».
   * Only on a form that stays in sight after saving.
   */
  saved?: boolean
  savedText?: string
}

/**
 * A form's submit button, busy and saying so while the form submits. Its
 * own text changes under the focus, which screen readers do not announce:
 * a hidden status next to it says it.
 *
 * @summary A form's submit button, busy while it submits.
 */
function SubmitButton({
  children,
  submitting,
  loadingText,
  variant = 'default',
  saved,
  savedText,
}: SubmitButtonProps) {
  const messages = useGoGoUIMessages()
  const savedWord = savedText ?? messages.saved

  return (
    <>
      {saved === undefined ? (
        <Button
          type="submit"
          variant={variant}
          loading={submitting}
          loadingText={loadingText}
        >
          {children}
        </Button>
      ) : (
        <MorphingButton
          submitting={submitting}
          saved={saved}
          savedText={savedWord}
          variant={variant}
        >
          {children}
        </MorphingButton>
      )}
      <span role="status" className="sr-only">
        {submitting ? loadingText : saved ? `${savedWord}.` : ''}
      </span>
    </>
  )
}

export { SubmitButton }
export type { SubmitButtonProps }
