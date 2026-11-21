import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover.tsx'

const meta = preview.meta({
  title: 'Composants/Popover',
  component: Popover,
})

/**
 * A short detail next to what it explains, closed by a click outside.
 */
export const Basic = meta.story({
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Conditions d'annulation
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Annulation</PopoverTitle>
          <PopoverDescription>
            L'acompte est rendu jusqu'à 90 jours avant la date.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
})
