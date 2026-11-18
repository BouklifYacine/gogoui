import { useState } from 'react'

import preview from '#.storybook/preview'

import { PhotoDropZone } from './photo-drop-zone.tsx'
import { PhotoPickerButton } from './photo-picker-button.tsx'

const meta = preview.meta({
  title: 'Formulaires/PhotoDropZone',
  component: PhotoDropZone,
  subcomponents: { PhotoPickerButton },
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * A venue's logo: drop an image on the square, or use the button.
 *
 * @summary A logo to drop or pick.
 */
export const Logo = meta.story({
  args: {
    shape: 'logo',
    description: 'Carré de préférence, JPEG, PNG ou WebP, 2 Mo au plus.',
    pickLabel: 'Choisir un logo',
    current: null,
    onPick: () =>
      new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1200)),
    onRefuse: () => {},
  },
})

/**
 * A photo picked by a button alone, for a grid of photos.
 *
 * @summary A button that picks a photo.
 */
export const PickerButton = meta.story({
  render: function Render() {
    const [loading, setLoading] = useState(false)
    return (
      <PhotoPickerButton
        loading={loading}
        onPick={() => {
          setLoading(true)
          setTimeout(() => setLoading(false), 1200)
        }}
      >
        Ajouter une photo
      </PhotoPickerButton>
    )
  },
})
