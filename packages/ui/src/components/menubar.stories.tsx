import preview from '#.storybook/preview'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from './menubar.tsx'

const meta = preview.meta({
  title: 'Composants/Menubar',
  component: Menubar,
  subcomponents: { MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem },
})

/**
 * An editor's menus: open one, then move to the others with the arrows or
 * the pointer.
 */
export const Basic = meta.story({
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Fichier</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Nouveau devis <MenubarShortcut>Ctrl N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Dupliquer</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Exporter en PDF</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Édition</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Annuler <MenubarShortcut>Ctrl Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Rétablir <MenubarShortcut>Ctrl Y</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Affichage</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem defaultChecked>Totaux TTC</MenubarCheckboxItem>
          <MenubarCheckboxItem>Lignes masquées</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
})
