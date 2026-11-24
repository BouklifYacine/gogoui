import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import type { GoGoUIMessages } from '../i18n/messages.ts'
import { Button } from './button.tsx'
import { DialogClose, DialogFooter } from './dialog.tsx'
import { SubmitButton } from './submit-button.tsx'

/** The words SettingDialogFooter writes, to change on one SettingDialogFooter only. */
type SettingDialogFooterLabels = Partial<Pick<GoGoUIMessages, 'cancel'>>

type SettingDialogFooterProps = {
  /** True while the form saves. */
  submitting: boolean
  /** « Enregistrer » by default. */
  submitLabel?: string
  /** « Enregistrement… » by default. */
  loadingText?: string
  /** Its words on this one only, over GoGoUIProvider's `messages`. */
  labels?: SettingDialogFooterLabels
}

/**
 * A setting dialog's « Annuler » and « Enregistrer ».
 *
 * **Key props**: `submitting`, `submitLabel`, `loadingText`,
 * `labels` to change its words.
 *
 * @summary A setting dialog's « Annuler » and « Enregistrer ».
 */
function SettingDialogFooter({
  submitting,
  submitLabel,
  loadingText,
  labels,
}: SettingDialogFooterProps) {
  const messages = useGoGoUIMessages(labels)
  return (
    <DialogFooter className="mt-2 sm:flex-row-reverse sm:justify-start">
      <SubmitButton
        submitting={submitting}
        loadingText={loadingText ?? messages.saving}
      >
        {submitLabel ?? messages.save}
      </SubmitButton>
      <DialogClose render={<Button variant="outline" />}>
        {messages.cancel}
      </DialogClose>
    </DialogFooter>
  )
}

export { SettingDialogFooter }
export type { SettingDialogFooterProps, SettingDialogFooterLabels }
