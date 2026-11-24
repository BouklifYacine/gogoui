import { useState } from 'react'

import preview from '#.storybook/preview'

import { PhotoPickerButton } from './photo-picker-button.tsx'

const meta = preview.meta({
  title: 'Formulaires/Fichiers/PhotoPickerButton',
  component: PhotoPickerButton,
})

/**
 * Picks a photo (JPEG, PNG or WebP) from the device; the button spins while
 * your code sends it, then says which file came in.
 */
export const Basic = meta.story({
  render: function Render() {
    const [sending, setSending] = useState(false)
    const [last, setLast] = useState<string | null>(null)
    return (
      <div className="flex flex-col items-start gap-2">
        <PhotoPickerButton
          loading={sending}
          onPick={(file) => {
            setSending(true)
            setTimeout(() => {
              setSending(false)
              setLast(file.name)
            }, 1000)
          }}
        >
          Ajouter une photo
        </PhotoPickerButton>
        <p role="status" className="text-sm text-fg-muted">
          {last ? `Reçue : ${last}` : null}
        </p>
      </div>
    )
  },
})

/**
 * While sending: the spinner and « Envoi de l'image… » (or `loadingText`).
 */
export const Loading = meta.story({
  args: {
    loading: true,
    children: 'Ajouter une photo',
    onPick: () => {},
  },
})

/**
 * Disabled, when the gallery is full.
 */
export const Disabled = meta.story({
  args: {
    loading: false,
    disabled: true,
    children: 'Ajouter une photo',
    onPick: () => {},
  },
})
