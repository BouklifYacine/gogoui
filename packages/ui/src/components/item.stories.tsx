import { CalendarBlankIcon, GoogleLogoIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Badge } from './badge.tsx'
import { Button } from './button.tsx'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from './item.tsx'

const meta = preview.meta({
  title: 'Composants/Item',
  component: Item,
  subcomponents: {
    ItemGroup,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
  },
  args: { variant: 'outline', size: 'default' },
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * Connected tools: an icon, its name and line, its state and action.
 * Change the variant and size in the controls.
 */
export const Basic = meta.story({
  render: (args) => (
    <ItemGroup>
      <Item {...args} role="listitem">
        <ItemMedia variant="icon">
          <GoogleLogoIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Google Agenda</ItemTitle>
          <ItemDescription>
            Vos visites et vos dates, des deux côtés.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="subtle" color="success">
            Connecté
          </Badge>
        </ItemActions>
      </Item>
      <Item {...args} role="listitem">
        <ItemMedia variant="icon">
          <CalendarBlankIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Outlook</ItemTitle>
          <ItemDescription>Pour les agendas Microsoft.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Connecter
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
})
