import { useState } from 'react'

import preview from '#.storybook/preview'

import { MobileSettingsSection } from './mobile-settings-section.tsx'
import { SettingDetail } from './setting-detail.tsx'
import { SettingDialog } from './setting-dialog.tsx'
import { SettingDialogFooter } from './setting-dialog-footer.tsx'
import { SettingRowSkeleton } from './setting-row-skeleton.tsx'
import { SettingSwitchRow } from './setting-switch-row.tsx'
import { SettingValueRow } from './setting-value-row.tsx'
import { SettingsList } from './settings-list.tsx'
import { TextareaField } from './textarea-field.tsx'

const meta = preview.meta({
  title: 'Réglages/SettingsList',
  component: SettingsList,
  subcomponents: {
    SettingSwitchRow,
    SettingValueRow,
    SettingDetail,
    SettingDialog,
    SettingDialogFooter,
  },
  decorators: [(Story) => <div className="w-[36rem]">{Story()}</div>],
})

/**
 * A settings page: a switch that applies at once, with its details and
 * their « Modifier »; a value changed in its dialog.
 */
export const Basic = meta.story({
  render: function Render() {
    const [reminders, setReminders] = useState(true)
    const [open, setOpen] = useState(false)
    const [signature, setSignature] = useState(
      'Marie, Domaine des Chênes\n06 12 34 56 78',
    )
    const [draft, setDraft] = useState(signature)
    const [saving, setSaving] = useState(false)
    return (
      <>
        <SettingsList>
          <SettingSwitchRow
            id="reminders"
            title="Relances automatiques"
            description="Un e-mail au couple quand il ne répond plus."
            checked={reminders}
            onCheckedChange={setReminders}
          >
            {reminders && (
              <SettingDetail
                editLabel="le délai de la relance"
                onEdit={() => setOpen(true)}
              >
                Après 7 jours de silence
              </SettingDetail>
            )}
          </SettingSwitchRow>
          <SettingValueRow
            title="Signature"
            description="Sous chaque e-mail envoyé."
            value={signature}
            onEdit={() => {
              setDraft(signature)
              setOpen(true)
            }}
          />
        </SettingsList>
        <SettingDialog
          open={open}
          onOpenChange={setOpen}
          title="Signature"
          description="Sous chaque e-mail envoyé au couple."
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setSaving(true)
              setTimeout(() => {
                setSignature(draft)
                setSaving(false)
                setOpen(false)
              }, 800)
            }}
          >
            <TextareaField
              name="signature"
              label="Signature"
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

/**
 * The same rows while the page loads.
 */
export const Loading = meta.story({
  render: () => (
    <SettingsList>
      <SettingRowSkeleton
        title="Relances automatiques"
        description="Un e-mail au couple quand il ne répond plus."
      />
      <SettingRowSkeleton
        title="Signature"
        description="Sous chaque e-mail envoyé."
        value="Marie, Domaine des Chênes"
      />
    </SettingsList>
  ),
})

/**
 * On a phone, each part of a long settings form folds into a card.
 */
export const FoldedOnPhone = meta.story({
  globals: { viewport: { value: 'phone' } },
  render: () => (
    <MobileSettingsSection
      title="Coordonnées"
      summary="Domaine des Chênes, Lyon"
    >
      <p className="text-fg-muted">Les champs du lieu.</p>
    </MobileSettingsSection>
  ),
})
