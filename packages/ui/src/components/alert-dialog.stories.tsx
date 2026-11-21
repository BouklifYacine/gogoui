import preview from '#.storybook/preview'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog.tsx'
import { Button } from './button.tsx'

const meta = preview.meta({
  title: 'Composants/AlertDialog',
  component: AlertDialog,
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
})
