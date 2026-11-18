import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { Button } from './button.tsx'
import { DialogClose, DialogFooter } from './dialog.tsx'
import { SubmitButton } from './submit-button.tsx'

type SettingDialogFooterProps = {
  /** True while the form saves. */
  submitting: boolean
  /** « Enregistrer » by default. */
  submitLabel?: string
  /** « Enregistrement… » by default. */
  loadingText?: string
}

/**
 * The end of a `SettingDialog`'s form: « Annuler » closes without saving,
 * « Enregistrer » submits the form around it.
 *
 * @summary A setting dialog's « Annuler » and « Enregistrer ».
 */
function SettingDialogFooter({
  submitting,
  submitLabel,
  loadingText,
}: SettingDialogFooterProps) {
  const messages = useGoGoUIMessages()
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
export type { SettingDialogFooterProps }
