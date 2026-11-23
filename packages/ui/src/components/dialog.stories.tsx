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

/**
 * The window rises 8px and grows from .96 on a spring that never
 * overshoots while its veil fades in; it leaves quicker and quieter. Close
 * it and reopen it at once: it turns back from where it is.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Ouvrir la fenêtre
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer le devis ?</DialogTitle>
            <DialogDescription>
              Le couple le reçoit par e-mail, avec le lien pour signer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Annuler
            </DialogClose>
            <DialogClose render={<Button />}>Envoyer</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Grande fenêtre
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Conditions de la salle</DialogTitle>
            <DialogDescription>
              La même entrée, quelle que soit la taille.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  ),
})
