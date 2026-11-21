import preview from '#.storybook/preview'

import { FileDrop } from './file-drop.tsx'

const meta = preview.meta({
  title: 'Formulaires/FileDrop',
  component: FileDrop,
  decorators: [(Story) => <div className="w-[28rem]">{Story()}</div>],
})

/**
 * A spreadsheet to import: drop it, click, or press Enter on the zone.
 */
export const Basic = meta.story({
  args: {
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    label: 'Choisir un fichier à importer',
    title: 'Glissez votre fichier ici',
    hint: 'CSV ou Excel, 5 Mo au plus',
    busyTitle: 'Lecture du fichier…',
    doneTitle: 'Fichier lu',
    refusal: () => 'Ce fichier n’est ni un CSV ni un Excel.',
    onFile: () =>
      new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1500)),
    onRefuse: () => {},
  },
})
