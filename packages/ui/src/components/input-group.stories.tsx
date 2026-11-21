import { MagnifyingGlassIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from './input-group.tsx'

const meta = preview.meta({
  title: 'Composants/InputGroup',
  component: InputGroup,
})

/**
 * A search field: the magnifier inside, before the text.
 */
export const Basic = meta.story({
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <MagnifyingGlassIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Rechercher un client"
        aria-label="Rechercher"
      />
    </InputGroup>
  ),
})

/**
 * An amount: the unit after the figure, inside the field.
 */
export const WithUnit = meta.story({
  render: () => (
    <InputGroup className="w-48">
      <InputGroupInput
        inputMode="decimal"
        placeholder="1 500"
        aria-label="Acompte"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>€</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
})
