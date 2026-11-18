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
  /** The safe way out of a confirmation. */
  cancel: string
  /** The toast's button that reverses what was just done. */
  undo: string
  /** The name of the toasts' region, for a screen reader. */
  notifications: string
  /** The × of a toast, for a screen reader. */
  closeNotification: string
  /** A copy button's word. */
  copy: string
  /** A copy button's word once the text is on the clipboard. */
  copied: string
  /** The eye of a password field, for a screen reader. */
  showPassword: string
  /** The « … » button of a row, for a screen reader. */
  rowActions: (name: string) => string
  /** A profile photo's description when the person has no name. */
  profilePhoto: string
  /** The language's code for dates and numbers (Intl). */
  intlLocale: string
  /** How a day is typed: day/month/year or month/day/year. */
  dayOrder: 'dmy' | 'mdy'
  /** A select's prompt while nothing is chosen. */
  choose: string
  /** The title of a form's error summary. */
  errorCount: (count: number) => string
  /** A submit button once saved. */
  saved: string
  /** A password's strength, from too short to very strong. */
  passwordLevels: readonly [string, string, string, string, string]
  /** What a too short password lacks. */
  passwordMissing: (count: number) => string
  /** Under a good password that could be longer. */
  passwordLonger: string
  /** Read aloud when the strength changes. */
  passwordStatus: (level: string) => string
  /** A time field's empty shape. */
  timePlaceholder: string
  /** A time typed that the list does not hold. */
  timeKeepTyped: string
  /** A date field's empty shape. */
  datePlaceholder: string
  /** A date typed that is not one. */
  dateTypedError: string
  /** A date that cannot be chosen. */
  dateUnavailable: string
  /** The calendar button of a date field, for a screen reader. */
  pickDate: (label: string) => string
  /** Under a colour field, the colour chosen. */
  chosenColor: (name: string) => string
  /** A search pill's word. */
  search: string
  /** An open search field's empty shape. */
  searchPlaceholder: string
  /** The × that empties a search. */
  clearSearch: string
  /** The Escape key's name on a keyboard hint. */
  escapeKey: string
  /** A search typed, on its pill or its chip. */
  searchQuery: (query: string) => string
  /** The name of the active filters' group. */
  activeFilters: string
  /** A filter chip's button, for a screen reader. */
  removeFilter: (label: string) => string
  /** Takes every filter off. */
  resetFilters: string
  /** The bar of ticked rows, for a screen reader. */
  selectedRows: string
  /** « Tout sélectionner » while it works. */
  selecting: string
  /** Ticks every row the filters keep. */
  selectAllCount: (count: number) => string
  /** The head row's box. */
  selectPage: string
  /** A row's box. */
  selectRow: (name: string) => string
  /** How many rows a filter keeps, read aloud. */
  resultCount: (count: number) => string
  /** A filter that keeps no row. */
  noResultsFor: (query: string) => string
  /** Under it. */
  noResultsHint: string
  /** Empties the filter. */
  clearFilter: string
  /** The sort drawer's title. */
  sortBy: string
  /** The sort chip before any sort. */
  sort: string
  /** A sort direction in words. */
  ascending: string
  descending: string
  /** The sort chip, for a screen reader. */
  sortedBy: (column: string, direction: string) => string
  /** The columns menu's button. */
  columns: string
  /** Its legend. */
  columnsToShow: string
  /** How many columns are hidden, for a screen reader. */
  hiddenColumns: (count: number) => string
  /** Shows every column again. */
  showAllColumns: string
  /** The page size select's label. */
  rowsPerPage: string
  /** « 1 à 10 sur 257 demandes ». */
  rowsRange: (first: number, last: number, total: string) => string
  /** A phone's « Voir 20 de plus ». */
  showMore: (count: number) => string
  /** Past the most rows a phone shows. */
  narrowToFindMore: string
  /** A page button, for a screen reader. */
  page: (page: number) => string
  /** The filters' button. */
  filter: string
  /** How many filters are on, for a screen reader. */
  activeFilterCount: (count: number) => string
  /** The filter groups' sidebar, for a screen reader. */
  filterCategories: string
  /** Takes every filter off, in the filters' menu. */
  resetAllFilters: string
  /** Back to the list of filter groups on a phone. */
  allFilters: string
  /** Closes the filters' drawer on the list. */
  seeResults: string
  /** A group with a filter on, for a screen reader. */
  activeSummary: (summary: string) => string
  /** A period's first day. */
  fromDay: string
  /** A period's last day. */
  untilDay: string
  /** Before the period calendar. */
  wholePeriod: string
  /** The period button's empty state. */
  pickDates: string
  /** Empties a period. */
  clearDates: string
  /** Closes a picker, keeping the choice. */
  confirm: string
  /** A range's low bound. */
  fromNumber: string
  /** A range's high bound. */
  upToNumber: string
  /** An amount typed wrong. */
  amountExample: string
  /** A count typed wrong. */
  countExample: string
  /** Two days in words, null when neither is chosen. */
  dateRange: (from?: string, to?: string) => string | null
  /** Two numbers in words, null when neither is chosen. */
  numberRange: (min?: string, max?: string) => string | null
  /** A slider's right end. */
  andMore: (value: string) => string
  /** A slider at its right end, for a screen reader. */
  noLimit: string
  /** Where one is in a few steps. */
  stepOf: (current: number, total: number) => string
  /** Opens what changes a setting. */
  edit: string
  /** Saves a form. */
  save: string
  /** While a form saves. */
  saving: string
  /** The slide's thumb, for a keyboard and a screen reader. */
  slideKeyboardHint: string
  /** A file dragged over a zone that refuses it. */
  fileRefused: string
  /** A file dragged over a zone that takes it. */
  dropHere: string
  /** Several images dropped at once. */
  onlyOneImage: string
  /** A file that is no image. */
  notAnImage: string
  /** An empty photo zone. */
  dropImage: string
  /** Over a photo, with a mouse. */
  change: string
  /** While an image is sent. */
  sendingImage: string
  /** Once it is saved. */
  imageSaved: string
  /** A link field's button. */
  copyLink: string
  /** Read once the link is copied. */
  linkCopied: string
  /** When the browser refuses the clipboard. */
  copyByHand: string
  /** A guide's offer: « Je vous montre comment … ? ». */
  guideOffer: (what: string) => string
  /** Under it. */
  guideLength: (steps: number) => string
  /** Starts the guide. */
  guideStart: string
  /** Declines it. */
  guideDecline: string
  /** Stops it. */
  guideStop: string
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
    cancel: 'Annuler',
    undo: 'Annuler',
    notifications: 'Notifications',
    closeNotification: 'Fermer la notification',
    copy: 'Copier',
    copied: 'Copié',
    showPassword: 'Afficher le mot de passe',
    rowActions: (name) => `Actions « ${name} »`,
    profilePhoto: 'Photo de profil',
    intlLocale: 'fr-FR',
    dayOrder: 'dmy',
    choose: 'Choisir',
    errorCount: (count) =>
      count > 1 ? `${count} points à corriger` : 'Un point à corriger',
    saved: 'Enregistré',
    passwordLevels: ['Trop court', 'Correct', 'Bon', 'Solide', 'Très solide'],
    passwordMissing: (count) =>
      `Encore ${count} caractère${count > 1 ? 's' : ''}`,
    passwordLonger: 'Plus long, plus solide',
    passwordStatus: (level) => `Mot de passe : ${level}.`,
    timePlaceholder: 'hh:mm',
    timeKeepTyped: 'Entrée pour garder cette heure.',
    datePlaceholder: 'jj/mm/aaaa',
    dateTypedError:
      'Saisissez une date jour, mois, année, par exemple 14/06/2027.',
    dateUnavailable: "Ce jour n'est pas disponible. Choisissez-en un autre.",
    pickDate: (label) => `Choisir « ${label} » dans le calendrier`,
    chosenColor: (name) => `Couleur choisie : ${name}`,
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher…',
    clearSearch: 'Effacer la recherche',
    escapeKey: 'Échap',
    searchQuery: (query) => `Recherche : ${query}`,
    activeFilters: 'Filtres actifs',
    removeFilter: (label) => `Retirer le filtre ${label}`,
    resetFilters: 'Réinitialiser',
    selectedRows: 'Lignes sélectionnées',
    selecting: 'Sélection…',
    selectAllCount: (count) => `Tout sélectionner (${count})`,
    selectPage: 'Sélectionner toutes les lignes de la page',
    selectRow: (name) => `Sélectionner ${name}`,
    resultCount: (count) =>
      count === 0
        ? 'Aucun résultat'
        : count === 1
          ? '1 résultat'
          : `${count} résultats`,
    noResultsFor: (query) => `Aucun résultat pour « ${query} »`,
    noResultsHint: 'Changez ou effacez le filtre pour revoir la liste.',
    clearFilter: 'Effacer le filtre',
    sortBy: 'Trier par',
    sort: 'Trier',
    ascending: 'croissant',
    descending: 'décroissant',
    sortedBy: (column, direction) => `Trié par ${column}, ${direction}`,
    columns: 'Colonnes',
    columnsToShow: 'Colonnes à afficher',
    hiddenColumns: (count) => `, ${count} masquée${count > 1 ? 's' : ''}`,
    showAllColumns: 'Tout afficher',
    rowsPerPage: 'Lignes par page',
    rowsRange: (first, last, total) => `${first} à ${last} sur ${total}`,
    showMore: (count) => `Voir ${count} de plus`,
    narrowToFindMore: 'Cherchez ou filtrez pour trouver les suivants.',
    page: (page) => `Page ${page}`,
    filter: 'Filtrer',
    activeFilterCount: (count) =>
      `, ${count} filtre${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`,
    filterCategories: 'Catégories de filtres',
    resetAllFilters: 'Réinitialiser les filtres',
    allFilters: 'Tous les filtres',
    seeResults: 'Voir les résultats',
    activeSummary: (summary) => `, actif : ${summary}`,
    fromDay: 'À partir du',
    untilDay: 'Jusqu’au',
    wholePeriod: 'Ou la période d’un coup :',
    pickDates: 'Choisir des dates',
    clearDates: 'Effacer',
    confirm: 'Valider',
    fromNumber: 'À partir de',
    upToNumber: 'Jusqu’à',
    amountExample: 'Saisissez un montant, par exemple 1 500 ou 1 500,50.',
    countExample: 'Saisissez un nombre, par exemple 120.',
    dateRange: (from, to) =>
      from && to
        ? `du ${from} au ${to}`
        : from
          ? `à partir du ${from}`
          : to
            ? `jusqu’au ${to}`
            : null,
    numberRange: (min, max) =>
      min && max
        ? `de ${min} à ${max}`
        : min
          ? `à partir de ${min}`
          : max
            ? `jusqu’à ${max}`
            : null,
    andMore: (value) => `${value} et +`,
    noLimit: 'sans limite',
    stepOf: (current, total) => `Étape ${current} sur ${total}`,
    edit: 'Modifier',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    slideKeyboardHint: 'Appuyez sur Entrée pour confirmer.',
    fileRefused: 'Ce fichier ne convient pas',
    dropHere: 'Lâchez le fichier ici',
    onlyOneImage: 'Déposez une seule image à la fois.',
    notAnImage: 'Ce fichier n’est pas une image JPEG, PNG ou WebP.',
    dropImage: 'Déposez une image',
    change: 'Changer',
    sendingImage: 'Envoi de l’image…',
    imageSaved: 'Image enregistrée.',
    copyLink: 'Copier le lien',
    linkCopied: 'Lien copié.',
    copyByHand: 'Copiez-le à la main : il est sélectionné dans le champ.',
    guideOffer: (what) => `Je vous montre comment ${what} ?`,
    guideLength: (steps) =>
      `${steps} étapes, et vous arrêtez quand vous voulez.`,
    guideStart: 'Me guider',
    guideDecline: 'Non merci',
    guideStop: 'Arrêter le guide',
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
    cancel: 'Cancel',
    undo: 'Undo',
    notifications: 'Notifications',
    closeNotification: 'Close the notification',
    copy: 'Copy',
    copied: 'Copied',
    showPassword: 'Show the password',
    rowActions: (name) => `Actions for “${name}”`,
    profilePhoto: 'Profile photo',
    intlLocale: 'en-US',
    dayOrder: 'mdy',
    choose: 'Choose',
    errorCount: (count) =>
      count > 1 ? `${count} things to fix` : 'One thing to fix',
    saved: 'Saved',
    passwordLevels: ['Too short', 'Fair', 'Good', 'Strong', 'Very strong'],
    passwordMissing: (count) =>
      `${count} more character${count > 1 ? 's' : ''}`,
    passwordLonger: 'Longer is stronger',
    passwordStatus: (level) => `Password: ${level}.`,
    timePlaceholder: 'hh:mm',
    timeKeepTyped: 'Press Enter to keep this time.',
    datePlaceholder: 'mm/dd/yyyy',
    dateTypedError: 'Type a date as month, day, year, for example 06/14/2027.',
    dateUnavailable: 'This day is not available. Choose another one.',
    pickDate: (label) => `Choose “${label}” in the calendar`,
    chosenColor: (name) => `Chosen colour: ${name}`,
    search: 'Search',
    searchPlaceholder: 'Search…',
    clearSearch: 'Clear the search',
    escapeKey: 'Esc',
    searchQuery: (query) => `Search: ${query}`,
    activeFilters: 'Active filters',
    removeFilter: (label) => `Remove the filter ${label}`,
    resetFilters: 'Reset',
    selectedRows: 'Selected rows',
    selecting: 'Selecting…',
    selectAllCount: (count) => `Select all (${count})`,
    selectPage: 'Select every row of the page',
    selectRow: (name) => `Select ${name}`,
    resultCount: (count) =>
      count === 0
        ? 'No results'
        : count === 1
          ? '1 result'
          : `${count} results`,
    noResultsFor: (query) => `No results for “${query}”`,
    noResultsHint: 'Change or clear the filter to see the list again.',
    clearFilter: 'Clear the filter',
    sortBy: 'Sort by',
    sort: 'Sort',
    ascending: 'ascending',
    descending: 'descending',
    sortedBy: (column, direction) => `Sorted by ${column}, ${direction}`,
    columns: 'Columns',
    columnsToShow: 'Columns to show',
    hiddenColumns: (count) => `, ${count} hidden`,
    showAllColumns: 'Show all',
    rowsPerPage: 'Rows per page',
    rowsRange: (first, last, total) => `${first} to ${last} of ${total}`,
    showMore: (count) => `Show ${count} more`,
    narrowToFindMore: 'Search or filter to find the next ones.',
    page: (page) => `Page ${page}`,
    filter: 'Filter',
    activeFilterCount: (count) =>
      `, ${count} active filter${count > 1 ? 's' : ''}`,
    filterCategories: 'Filter categories',
    resetAllFilters: 'Reset the filters',
    allFilters: 'All filters',
    seeResults: 'See the results',
    activeSummary: (summary) => `, active: ${summary}`,
    fromDay: 'From',
    untilDay: 'Until',
    wholePeriod: 'Or the whole period at once:',
    pickDates: 'Choose dates',
    clearDates: 'Clear',
    confirm: 'Done',
    fromNumber: 'From',
    upToNumber: 'Up to',
    amountExample: 'Type an amount, for example 1,500 or 1,500.50.',
    countExample: 'Type a number, for example 120.',
    dateRange: (from, to) =>
      from && to
        ? `from ${from} to ${to}`
        : from
          ? `from ${from}`
          : to
            ? `until ${to}`
            : null,
    numberRange: (min, max) =>
      min && max
        ? `from ${min} to ${max}`
        : min
          ? `from ${min}`
          : max
            ? `up to ${max}`
            : null,
    andMore: (value) => `${value}+`,
    noLimit: 'no limit',
    stepOf: (current, total) => `Step ${current} of ${total}`,
    edit: 'Edit',
    save: 'Save',
    saving: 'Saving…',
    slideKeyboardHint: 'Press Enter to confirm.',
    fileRefused: 'This file does not fit',
    dropHere: 'Drop the file here',
    onlyOneImage: 'Drop one image at a time.',
    notAnImage: 'This file is not a JPEG, PNG or WebP image.',
    dropImage: 'Drop an image',
    change: 'Change',
    sendingImage: 'Sending the image…',
    imageSaved: 'Image saved.',
    copyLink: 'Copy the link',
    linkCopied: 'Link copied.',
    copyByHand: 'Copy it by hand: it is selected in the field.',
    guideOffer: (what) => `Shall I show you how to ${what}?`,
    guideLength: (steps) => `${steps} steps, and you stop whenever you like.`,
    guideStart: 'Guide me',
    guideDecline: 'No thanks',
    guideStop: 'Stop the guide',
  },
}
