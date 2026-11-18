/**
 * Every word GoGoUI writes on its own (a screen reader label, a default
 * button). A project passes its language, or its own words, to
 * GoGoUIProvider.
 */
export type GoGoUIMessages = {
  /** The close button of a dialog or a sheet. */
  close: string
  /** Said by a spinner standing alone. */
  loading: string
  /** The « … » of a breadcrumb that hides pages. */
  more: string
  /** The × that empties a combobox. */
  clear: string
  /** The arrow that opens a combobox's list. */
  showOptions: string
  /** The name of a breadcrumb for a screen reader. */
  breadcrumb: string
  /** The hidden title of the command palette. */
  commandTitle: string
  /** The hidden description of the command palette. */
  commandDescription: string
  /** The name of a pagination for a screen reader. */
  pages: string
  /** The pagination's way back. */
  previous: string
  /** The pagination's way forward. */
  next: string
  /** The sidebar's name on a phone, and its button's word. */
  menu: string
  /** The hidden description of the sidebar on a phone. */
  navigation: string
  /** The sidebar's toggle, for a screen reader. */
  toggleMenu: string
}

export type GoGoUILocale = 'fr' | 'en'

export const messages: Record<GoGoUILocale, GoGoUIMessages> = {
  fr: {
    close: 'Fermer',
    loading: 'Chargement',
    more: 'Plus',
    clear: 'Effacer le choix',
    showOptions: 'Afficher les choix',
    breadcrumb: "Fil d'Ariane",
    commandTitle: 'Palette de commandes',
    commandDescription: 'Cherchez une commande à lancer…',
    pages: 'Pages',
    previous: 'Précédent',
    next: 'Suivant',
    menu: 'Menu',
    navigation: 'Navigation',
    toggleMenu: 'Afficher ou masquer le menu',
  },
  en: {
    close: 'Close',
    loading: 'Loading',
    more: 'More',
    clear: 'Clear',
    showOptions: 'Show options',
    breadcrumb: 'Breadcrumb',
    commandTitle: 'Command palette',
    commandDescription: 'Search for a command to run…',
    pages: 'Pages',
    previous: 'Previous',
    next: 'Next',
    menu: 'Menu',
    navigation: 'Navigation',
    toggleMenu: 'Toggle the menu',
  },
}
