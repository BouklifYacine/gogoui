import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { Input } from './input.tsx'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog.tsx'

const meta = preview.meta({
  title: 'Composants/Dialog',
  component: Dialog,
})

/**
 * A short form in a window: title, one sentence, the fields, then the
 * actions with the main one last. Escape or the × closes it.
 *
 * @summary A small form in a modal window.
 */
export const Basic = meta.story({
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Renommer la salle
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renommer la salle</DialogTitle>
          <DialogDescription>
            Le nouveau nom apparaît partout, devis compris.
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="room-name" className="grid gap-2 text-sm font-medium">
          Nom
          <Input id="room-name" defaultValue="Orangerie" />
        </label>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Annuler
          </DialogClose>
          <Button>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
})

/**
 * Confirming what cannot be undone: the title asks, the description says
 * what is lost, `danger` confirms. The default focus goes to « Annuler ».
 *
 * @summary Confirm an irreversible action.
 */
export const Confirmation = meta.story({
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        Supprimer la date
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Supprimer le samedi 12 juin ?</DialogTitle>
          <DialogDescription>
            La date est libérée et le couple n'est pas prévenu.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Annuler
          </DialogClose>
          <Button variant="danger">Supprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
})

/**
 * Information only: the footer's own « Fermer » (in the provider's
 * language) is enough.
 *
 * @summary A read-only dialog with its close button.
 */
export const InformationOnly = meta.story({
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" />}>
        Comment ça marche ?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>L'option sur une date</DialogTitle>
          <DialogDescription>
            Une option bloque la date pendant 7 jours, le temps que le couple
            réponde.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
})

/**
 * The widths: sm for a question, default for a short form, lg and xl for
 * a long one, full for a whole page.
 *
 * @summary A dialog in each width.
 */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['sm', 'default', 'lg', 'xl', 'full'] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger render={<Button variant="outline" />}>
            {size}
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Taille {size}</DialogTitle>
              <DialogDescription>
                La même fenêtre, plus ou moins large.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
})
