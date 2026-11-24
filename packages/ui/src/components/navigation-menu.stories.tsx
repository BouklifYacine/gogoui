import preview from '#.storybook/preview'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu.tsx'

const meta = preview.meta({
  title: 'Navigation/NavigationMenu',
  component: NavigationMenu,
  subcomponents: {
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
  },
  parameters: { layout: 'padded' },
})

const product = [
  ['Demandes', 'Toutes les demandes des couples au même endroit.'],
  ['Calendrier', 'Vos dates, options et visites en un coup d’œil.'],
  ['Devis', 'Un devis envoyé en deux minutes.'],
  ['Paiements', 'Acomptes et soldes suivis sans relance.'],
]

/**
 * A site's navigation: « Produit » opens a panel of links, « Tarifs » is
 * a plain link.
 */
export const Basic = meta.story({
  render: () => (
    <div className="h-72">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Produit</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[30rem] grid-cols-2 gap-1">
                {product.map(([title, text]) => (
                  <li key={title}>
                    <NavigationMenuLink href={`#${title}`}>
                      <span className="font-medium">{title}</span>
                      <span className="text-fg-muted">{text}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="#tarifs"
              className={navigationMenuTriggerStyle}
            >
              Tarifs
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  ),
})
