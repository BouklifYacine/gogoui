import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { ButtonGroup } from './button-group.tsx'

const meta = preview.meta({
  title: 'Composants/ButtonGroup',
  component: ButtonGroup,
})

/**
 * Moving through a calendar: back, today, forward, glued as one control.
 *
 * @summary Related buttons joined into one control.
 */
export const Basic = meta.story({
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Mois précédent">
        <CaretLeftIcon />
      </Button>
      <Button variant="outline">Aujourd'hui</Button>
      <Button variant="outline" size="icon" aria-label="Mois suivant">
        <CaretRightIcon />
      </Button>
    </ButtonGroup>
  ),
})
