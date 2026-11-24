import { useState } from 'react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { SettingDialog } from './setting-dialog.tsx'
import { SettingDialogFooter } from './setting-dialog-footer.tsx'
import { TextField } from './text-field.tsx'

const meta = preview.meta({
  title: 'Réglages/SettingDialog',
  component: SettingDialog,
  subcomponents: { SettingDialogFooter },
})

/**
 * The dialog that changes one setting: its form, then
 * `SettingDialogFooter` (« Annuler », « Enregistrer »). The form is
 * mounted while the dialog is open, so it starts from the saved value.
 */
export const Basic = meta.story({
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('Atelier Nord')
    const [draft, setDraft] = useState(name)
    const [saving, setSaving] = useState(false)
    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            setDraft(name)
            setOpen(true)
          }}
        >
          Modifier le nom
        </Button>
        <SettingDialog
          open={open}
          onOpenChange={setOpen}
          title="Nom de l'espace"
          description="Il s'affiche en haut de chaque page."
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setSaving(true)
              setTimeout(() => {
                setName(draft)
                setSaving(false)
                setOpen(false)
              }, 800)
            }}
          >
            <TextField
              name="workspace-name"
              label="Nom"
              value={draft}
              onValueChange={setDraft}
            />
            <SettingDialogFooter submitting={saving} />
          </form>
        </SettingDialog>
      </>
    )
  },
})
