import { useState } from 'react'

import preview from '#.storybook/preview'

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
} from './file-upload.tsx'
import type { FileUploadEntry, FileUploadHandler } from './file-upload.tsx'

const meta = preview.meta({
  title: 'Formulaires/FileUpload',
  component: FileUpload,
  decorators: [
    (Story) => <div className="w-[30rem] max-w-full">{Story()}</div>,
  ],
})

/**
 * A pretend upload: it moves in uneven steps, and a file named with
 * « erreur » fails halfway.
 */
const fakeUpload: FileUploadHandler = (item, { onProgress, signal }) =>
  new Promise<void>((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 8 + Math.random() * 22)
      onProgress(progress)
      if (item.name.includes('erreur') && progress > 50) {
        clearInterval(timer)
        reject(new Error('Le serveur a refusé le fichier'))
      } else if (progress >= 100) {
        clearInterval(timer)
        resolve()
      }
    }, 320)
    signal.addEventListener('abort', () => clearInterval(timer))
  })

/**
 * Photos of the venue: drop them, paste them, or press Enter on the zone.
 * Each row drops in, uploads, then ticks.
 */
export const Basic = meta.story({
  args: {
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 6,
    maxSize: 8_000_000,
    color: 'primary',
    size: 'default',
    disabled: false,
    onUpload: fakeUpload,
    children: null,
  },
  render: (args) => (
    <FileUpload {...args}>
      <FileUploadDropzone
        title="Ajoutez les photos du lieu"
        hint="JPEG, PNG ou WebP, 8 Mo au plus"
      />
      <FileUploadList />
    </FileUpload>
  ),
})

/**
 * Drag a file over the zone: the dashes close into a line, a light leans
 * towards the file, the zone breathes and the sheets fan out. Drop several:
 * the rows fall in one after another, the bars and percentages run on one
 * spring, a circle then a tick draw at 100 %. A file named « erreur… »
 * fails: its row shakes and « Réessayer » opens.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <FileUpload onUpload={fakeUpload} maxFiles={8}>
      <FileUploadDropzone hint="Tous types, 8 fichiers au plus" />
      <FileUploadList />
    </FileUpload>
  ),
})

/** The list inside the zone's edge, which folds to a slim bar from 3 files. */
export const InsideAndCompact = meta.story({
  render: () => (
    <FileUpload onUpload={fakeUpload} compactAt={3} maxFiles={8}>
      <FileUploadDropzone hint="Documents de l’événement">
        <FileUploadList />
      </FileUploadDropzone>
    </FileUpload>
  ),
})

const sent: FileUploadEntry[] = [
  { id: 'plan', name: 'plan-de-table.pdf', size: 420_000, status: 'uploaded' },
  {
    id: 'devis',
    name: 'devis-traiteur-final-signé.pdf',
    size: 1_200_000,
    status: 'failed',
    error: 'Connexion perdue',
  },
]

/**
 * Files sent earlier, one that failed; the page follows the rows through
 * `onItemsChange`.
 */
export const WithEarlierFiles = meta.story({
  render: function Render() {
    const [items, setItems] = useState(sent)
    const done = items.filter((item) => item.status === 'uploaded').length
    return (
      <div className="grid gap-3">
        <FileUpload
          defaultItems={sent}
          onItemsChange={setItems}
          onUpload={fakeUpload}
        >
          <FileUploadDropzone />
          <FileUploadList />
        </FileUpload>
        <p className="text-xs text-fg-subtle">
          {done} sur {items.length} envoyés
        </p>
      </div>
    )
  },
})

/** Without `onUpload`: the list only shows what was chosen. */
export const SelectionOnly = meta.story({
  render: () => (
    <FileUpload accept={{ 'application/pdf': ['.pdf'] }} maxFiles={3}>
      <FileUploadDropzone hint="PDF, 3 fichiers au plus" />
      <FileUploadList />
    </FileUpload>
  ),
})
