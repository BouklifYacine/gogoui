import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet.tsx'

const meta = preview.meta({
  title: 'Composants/Sheet',
  component: Sheet,
})

/**
 * Filters of a list in a side panel: the list stays behind, in context.
 */
export const Basic = meta.story({
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Filtres</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
          <SheetDescription>Affinez la liste des demandes.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 px-6 text-sm text-fg-muted">
          Les filtres se placent ici.
        </div>
        <SheetFooter>
          <Button>Voir 12 demandes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
})
