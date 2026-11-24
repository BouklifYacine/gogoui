import preview from '#.storybook/preview'

import { PillTabsSkeleton } from './pill-tabs-skeleton.tsx'

const meta = preview.meta({
  title: 'Navigation/PillTabsSkeleton',
  component: PillTabsSkeleton,
})

/**
 * Pill tabs while they load: the real labels and counts give the tray its
 * width.
 */
export const Basic = meta.story({
  args: {
    tabs: [
      { label: 'Tous', count: '42' },
      { label: 'Ouverts', count: '12' },
      { label: 'Fermés', count: '30' },
      'Archivés',
    ],
  },
})

/**
 * Labels alone, without counts.
 */
export const LabelsOnly = meta.story({
  args: { tabs: ['Semaine', 'Mois', 'Année'] },
})
