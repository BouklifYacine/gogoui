import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { Spinner } from './spinner.tsx'

const meta = preview.meta({
  title: 'Retours/Spinner',
  component: Spinner,
})

/**
 * Alone in a small zone, it says « Chargement » to a screen reader.
 */
export const Basic = meta.story({
  render: (args) => (
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      <Spinner {...args} />
      Mise à jour de la liste
    </div>
  ),
})

/**
 * Its size through `className`, its colour through `color` (the words
 * around it by default).
 */
export const SizesAndColors = meta.story({
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner />
      <Spinner className="size-5" color="primary" />
      <Spinner className="size-6" color="info" />
      <Spinner className="size-8" color="success" />
    </div>
  ),
})

/**
 * Inside a button, prefer its `loading` prop: the button keeps its width
 * and says it is busy.
 */
export const InAButton = meta.story({
  render: () => (
    <Button loading loadingText="Envoi…">
      Envoyer
    </Button>
  ),
})
