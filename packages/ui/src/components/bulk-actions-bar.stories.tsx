import { ArchiveIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { BulkActionsBar } from './bulk-actions-bar.tsx'
import { Button } from './button.tsx'

const meta = preview.meta({
  title: 'Listes/BulkActionsBar',
  component: BulkActionsBar,
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * Three rows ticked: their count, « Tout sélectionner » and the action.
 *
 * @summary The ticked rows' bar.
 */
export const Basic = meta.story({
  args: {
    label: '3 clients sélectionnés',
    selectAll: { label: 'Tout sélectionner (42)', onSelect: () => {} },
    actions: (
      <Button variant="outline" size="sm">
        <ArchiveIcon aria-hidden="true" />
        Archiver
      </Button>
    ),
  },
})
