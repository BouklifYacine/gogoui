import preview from '#.storybook/preview'

import { Alert, AlertDescription, AlertTitle } from './alert.tsx'
import { Button } from './button.tsx'

const meta = preview.meta({
  title: 'Composants/Alert',
  component: Alert,
  subcomponents: { AlertTitle, AlertDescription },
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

/**
 * Something to know before going on.
 *
 * @summary An information in the page.
 */
export const Info = meta.story({
  render: () => (
    <Alert color="info">
      <AlertTitle>Votre essai finit dans 5 jours</AlertTitle>
      <AlertDescription>
        Ajoutez une carte pour garder vos demandes et vos devis.
      </AlertDescription>
    </Alert>
  ),
})

/**
 * The four states, each with its icon and its words.
 *
 * @summary Info, success, warning and failure.
 */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert color="neutral">
        <AlertTitle>Aucune relance prévue cette semaine</AlertTitle>
      </Alert>
      <Alert color="success">
        <AlertTitle>Votre agenda Google est connecté</AlertTitle>
      </Alert>
      <Alert color="warning">
        <AlertTitle>La date est déjà en option pour un autre couple</AlertTitle>
      </Alert>
      <Alert
        color="danger"
        action={
          <Button variant="outline" size="sm">
            Réessayer
          </Button>
        }
      >
        <AlertTitle>La synchronisation a échoué</AlertTitle>
        <AlertDescription>
          Vos dates ne sont plus à jour depuis hier.
        </AlertDescription>
      </Alert>
    </div>
  ),
})
