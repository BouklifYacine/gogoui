import { useState } from 'react'
import {
  BeerBottleIcon,
  CakeIcon,
  CameraIcon,
  ChampagneIcon,
  FlowerIcon,
  MusicNotesIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { IconField } from './icon-field.tsx'

const meta = preview.meta({
  title: 'Formulaires/IconField',
  component: IconField,
})

/**
 * An icon for a catalogue item, its name under the grid.
 *
 * @summary One icon among tiles.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('champagne')
    return (
      <IconField
        name="icon"
        legend="Icône"
        options={[
          { value: 'champagne', label: 'Champagne', icon: ChampagneIcon },
          { value: 'beer', label: 'Bière', icon: BeerBottleIcon },
          { value: 'cake', label: 'Gâteau', icon: CakeIcon },
          { value: 'flowers', label: 'Fleurs', icon: FlowerIcon },
          { value: 'music', label: 'Musique', icon: MusicNotesIcon },
          { value: 'photo', label: 'Photo', icon: CameraIcon },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
})
