import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer.tsx'

const meta = preview.meta({
  title: 'Composants/Drawer',
  component: Drawer,
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
})
