import { EnvelopeSimpleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { InputWithIcon } from './input-with-icon.tsx'
import { Label } from './label.tsx'

const meta = preview.meta({
  title: 'Composants/InputWithIcon',
  component: InputWithIcon,
})

/**
 * A search field: the magnifier says what the field does at a glance, the
 * hidden label names it for a screen reader.
 */
export const Search = meta.story({
  args: {
    icon: MagnifyingGlassIcon,
    placeholder: 'Rechercher un client',
    disabled: false,
  },
  render: (args) => (
    <div className="w-72">
      <Label htmlFor="search" className="sr-only">
        Rechercher un client
      </Label>
      <InputWithIcon {...args} id="search" type="search" />
    </div>
  ),
})

/**
 * An e-mail field under its visible label.
 */
export const Email = meta.story({
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="email">E-mail</Label>
      <InputWithIcon
        id="email"
        type="email"
        autoComplete="email"
        icon={EnvelopeSimpleIcon}
      />
    </div>
  ),
})
