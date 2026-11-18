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
 *
 * @summary Tabs with a sliding pill.
 */
export const Basic = meta.story({
  render: function Render() {
    const [value, setValue] = useState('all')
    return (
      <Tabs value={value} onValueChange={(next) => setValue(String(next))}>
        <PillTabsList
          label="Demandes à afficher"
          value={value}
          tabs={[
            { value: 'all', label: 'Toutes', count: 24 },
            {
              value: 'unread',
              label: 'Non lues',
              count: 3,
              countLabel: 'non lues',
            },
            { value: 'won', label: 'Gagnées', count: 8, countTone: 'success' },
            { value: 'archived', label: 'Archivées' },
          ]}
        />
      </Tabs>
    )
  },
})

/**
 * The same tabs while the page loads.
 *
 * @summary Pill tabs while they load.
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
