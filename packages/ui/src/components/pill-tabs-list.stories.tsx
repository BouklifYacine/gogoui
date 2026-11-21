import { useState } from 'react'

import preview from '#.storybook/preview'

import { PillTabsList } from './pill-tabs-list.tsx'
import { PillTabsSkeleton } from './pill-tabs-skeleton.tsx'
import { Tabs } from './tabs.tsx'

const meta = preview.meta({
  title: 'Mise en page/PillTabsList',
  component: PillTabsList,
})

/**
 * Click another tab: the pill stretches to it, its leading edge first.
 */
export const Basic = meta.story({
  args: {
    label: 'Demandes à afficher',
    value: 'all',
    color: undefined,
    slides: true,
    tabs: [
      { value: 'all', label: 'Toutes', count: 24 },
      { value: 'unread', label: 'Non lues', count: 3, countLabel: 'non lues' },
      { value: 'won', label: 'Gagnées', count: 8, countTone: 'success' },
      { value: 'archived', label: 'Archivées' },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <Tabs value={value} onValueChange={(next) => setValue(String(next))}>
        <PillTabsList {...args} value={value} />
      </Tabs>
    )
  },
})

/**
 * The same tabs while the page loads.
 */
export const Loading = meta.story({
  render: () => (
    <PillTabsSkeleton
      tabs={[
        { label: 'Toutes', count: '24' },
        { label: 'Non lues', count: '3' },
        { label: 'Gagnées', count: '8' },
        'Archivées',
      ]}
    />
  ),
})
