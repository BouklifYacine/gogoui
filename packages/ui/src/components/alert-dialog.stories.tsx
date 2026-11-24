import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog.tsx'
import { Button } from './button.tsx'

const meta = preview.meta({
  title: 'Confirmations/AlertDialog',
  component: AlertDialog,
  subcomponents: {
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
  },
})

/**
 * Leaving a form with unsaved changes: the question must be answered, a
 * click outside does nothing. The safe choice comes first.
 */
export const Basic = meta.story({
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Quitter la page
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitter sans enregistrer ?</AlertDialogTitle>
          <AlertDialogDescription>
            Les modifications du devis seront perdues.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Rester</AlertDialogCancel>
          <AlertDialogAction variant="danger">Quitter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  // Opens with the focus inside; Escape answers « Rester » and gives the
  // focus back to the button.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Quitter la page',
    })
    await userEvent.click(trigger)
    const dialog = await page.findByRole('alertdialog', {
      name: 'Quitter sans enregistrer ?',
    })
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  },
})
