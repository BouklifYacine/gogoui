import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card.tsx'

const meta = preview.meta({
  title: 'Affichage/Card',
  component: Card,
})

/**
 * A figure and what it means, with the action that follows from it.
 */
export const Basic = meta.story({
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Acomptes en attente</CardTitle>
        <CardDescription>À encaisser ce mois-ci</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Voir
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="amount text-3xl font-medium">4 800 €</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Relancer les couples
        </Button>
      </CardFooter>
    </Card>
  ),
})
