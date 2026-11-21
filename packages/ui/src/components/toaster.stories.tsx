import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { Toaster, toast, useToastWithUndo } from './toaster.tsx'

const meta = preview.meta({
  title: 'Composants/Toaster',
  component: Toaster,
  parameters: { layout: 'padded' },
})

/**
 * One `Toaster` at the root, then `toast.success`, `toast.info`,
 * `toast.warning` from anywhere.
 */
export const Basic = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toaster />
      <Button variant="outline" onClick={() => toast.success('Devis envoyé')}>
        Succès
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('Nouvelle demande', {
            description: 'Marie et Lucas, samedi 12 juin',
          })
        }
      >
        Information
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning('La date est en option ailleurs')}
      >
        Attention
      </Button>
    </div>
  ),
})

/**
 * A reversible action: done at once, « Annuler » for ten seconds.
 */
export const WithUndo = meta.story({
  render: function Render() {
    const toastWithUndo = useToastWithUndo()
    return (
      <>
        <Toaster />
        <Button
          variant="outline"
          onClick={() =>
            toastWithUndo('Client archivé', () => toast.info('Client rétabli'))
          }
        >
          Archiver le client
        </Button>
      </>
    )
  },
})

/**
 * Work that takes time: « Envoi… » with a turning circle, then
 * « Devis envoyé », or the reason it failed (`toast.promise`).
 */
export const Promise_ = meta.story({
  name: 'Promise',
  render: () => (
    <div className="flex gap-2">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: 'Envoi du devis…',
            success: 'Devis envoyé',
            error: 'L’envoi a échoué',
          })
        }
      >
        Envoyer (réussit)
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((_, reject) => setTimeout(reject, 1500)), {
            loading: 'Envoi du devis…',
            success: 'Devis envoyé',
            error: 'L’envoi a échoué, réessayez',
          })
        }
      >
        Envoyer (échoue)
      </Button>
    </div>
  ),
})
