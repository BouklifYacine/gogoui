import { expect, userEvent, waitFor, within } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerSwipeHandle,
  DrawerTitle,
  DrawerTrigger,
} from './drawer.tsx'

const meta = preview.meta({
  title: 'Fenêtres/Drawer',
  component: Drawer,
  subcomponents: {
    DrawerTrigger,
    DrawerContent,
    DrawerSwipeHandle,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
  },
  globals: { viewport: { value: 'phone' } },
})

/**
 * On a phone, the actions of a row rise from the bottom, under the thumb;
 * a swipe down closes them.
 */
export const Basic = meta.story({
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Actions
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Samedi 12 juin</DrawerTitle>
          <DrawerDescription>Mariage de Léa et Hugo</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Ouvrir la demande</Button>
          <DrawerClose render={<Button variant="outline" />}>
            Annuler
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  // Opens with the focus inside; Escape closes it and gives the focus back
  // to its button.
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Actions',
    })
    await userEvent.click(trigger)
    const drawer = await page.findByRole('dialog', { name: 'Samedi 12 juin' })
    await waitFor(() =>
      expect(drawer).toContainElement(document.activeElement as HTMLElement),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  },
})
