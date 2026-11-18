import { PlusIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { PageHeader } from './page-header.tsx'
import { PageHeaderSkeleton } from './page-header-skeleton.tsx'
import { SkeletonButton } from './skeleton.tsx'

const meta = preview.meta({
  title: 'Mise en page/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
})

/**
 * A list page's header: title, one sentence, the main button.
 *
 * @summary A page's title and buttons.
 */
export const Basic = meta.story({
  args: {
    title: 'Clients',
    description:
      'Les couples qui vous ont écrit, du premier contact au jour J.',
    actions: (
      <Button>
        <PlusIcon aria-hidden="true" />
        Ajouter un client
      </Button>
    ),
  },
})

/**
 * The same header while the page loads.
 *
 * @summary A page's header while it loads.
 */
export const Loading = meta.story({
  render: () => (
    <PageHeaderSkeleton
      title="Clients"
      description="Les couples qui vous ont écrit, du premier contact au jour J."
      actions={<SkeletonButton>Ajouter un client</SkeletonButton>}
    />
  ),
})
