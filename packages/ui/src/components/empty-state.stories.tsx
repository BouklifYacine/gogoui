import { UsersThreeIcon } from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { EmptyState } from './empty-state.tsx'

const meta = preview.meta({
  title: 'Listes/EmptyState',
  component: EmptyState,
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * An empty list: what is missing, then the button that fills it.
 *
 * @summary An empty list and its way out.
 */
export const Basic = meta.story({
  args: {
    icon: <UsersThreeIcon />,
    title: "Aucun client pour l'instant",
    headingLevel: 2,
    description: 'Vos clients arrivent avec leurs demandes.',
    action: <Button>Ajouter un client</Button>,
  },
})

/**
 * The whole page is empty: the state is its centre.
 *
 * @summary A whole empty page.
 */
export const Large = meta.story({
  args: {
    icon: <UsersThreeIcon />,
    title: 'Bienvenue',
    headingLevel: 2,
    description: 'Ajoutez votre premier client pour commencer.',
    action: <Button>Ajouter un client</Button>,
    size: 'large',
  },
})
