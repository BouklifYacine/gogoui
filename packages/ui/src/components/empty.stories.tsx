import { FileTextIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './empty.tsx'

const meta = preview.meta({
  title: 'Composants/Empty',
  component: Empty,
})

/**
 * A list with nothing yet: say what will be here and offer the action that
 * fills it.
 *
 * @summary An empty list with its first action.
 */
export const Basic = meta.story({
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileTextIcon />
        </EmptyMedia>
        <EmptyTitle>Pas encore de facture</EmptyTitle>
        <EmptyDescription>
          Vos factures apparaîtront ici dès le premier acompte.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Créer une facture</Button>
      </EmptyContent>
    </Empty>
  ),
})
