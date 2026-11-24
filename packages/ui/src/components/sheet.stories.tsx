import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet.tsx'

const meta = preview.meta({
  title: 'Fenêtres/Sheet',
  component: Sheet,
  subcomponents: {
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
  },
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
  // Opens with the focus inside; Escape closes it and gives the focus back
  // to its button.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Filtres',
    })
    await userEvent.click(trigger)
    const sheet = await page.findByRole('dialog', { name: 'Filtres' })
    await waitFor(() =>
      expect(sheet).toContainElement(document.activeElement as HTMLElement),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  },
})
