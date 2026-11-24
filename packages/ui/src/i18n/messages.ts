import { en } from './locales/en.ts'
import { fr } from './locales/fr.ts'

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
  /** A number field's − button. */
  decrease: string
  /** A number field's + button. */
  increase: string
  /** A figure that went up, for a screen reader. */
  trendUp: (change: string) => string
  /** A figure that went down. */
  trendDown: (change: string) => string
  /** A figure that did not move. */
  trendFlat: string
  /** The theme switch's name. */
  theme: string
  /** The themes. */
  themeLight: string
  themeDark: string
  themeSystem: string
  /** A period's shortcuts. */
  presetToday: string
  presetLast7Days: string
  presetLast30Days: string
  presetThisMonth: string
  presetLastMonth: string
  presetNext30Days: string
  /** The shortcuts' group, for a screen reader. */
  presets: string
  /** Read aloud near a text's limit. */
  charactersLeft: (count: number) => string
  /** A carousel's name and its buttons. */
  carousel: string
  previousSlide: string
  nextSlide: string
  /** Where one is in a carousel. */
  slideOf: (current: number, total: number) => string
  /** A rich text editor's buttons. */
  bold: string
  italic: string
  strike: string
  bulletList: string
  orderedList: string
  heading: string
  quote: string
  undo2: string
  redo: string
  formatting: string
  // Fields, PasswordStrength, TagInput, MentionInput, ExpandableText (after Arc UI).
  /** The name of a password's strength meter. */
  passwordMeter: string
  /** The meter's value while the password is empty. */
  passwordEmpty: string
  /** The name of a password's list of conditions. */
  passwordRules: string
  /** Read after a condition, met or not. */
  passwordRuleMet: string
  passwordRuleNotMet: string
  /** The conditions of GoGoUI's score: the minimum, 14 and 18 characters, three kinds. */
  passwordRuleMin: (count: number) => string
  passwordRuleLength: (count: number) => string
  passwordRuleKinds: string
  /** What a length condition still lacks (« encore 4 »); the number rolls. */
  passwordRemaining: (count: number) => string
  /** A tag field's announcements and its × buttons. */
  tagAdded: (tag: string) => string
  tagRemoved: (tag: string) => string
  tagDuplicate: (tag: string) => string
  tagSelected: (tag: string) => string
  removeTag: (tag: string) => string
  /** The × of a chip whose words are not plain text. */
  removeChoice: string
  /** Read when a tag field is full. */
  tagLimit: (max: number) => string
  /** The name of a mention field's list of people. */
  mentionPeople: string
  /** How many people the list offers, read aloud. */
  mentionCount: (count: number) => string
  /** The list when no one matches what was typed after @. */
  mentionNoMatch: (query: string) => string
  /** The button of a text cut short. */
  readMore: string
  showLess: string
  // HoldToConfirm, UserMenu, ShortcutRecorder (after Arc UI).
  /** Under a hold-to-confirm button, for a screen reader. */
  holdHint: (seconds: string) => string
  /** The account menu's button, for a screen reader. */
  accountMenu: (name: string) => string
  /** The account menu's last row. */
  signOut: string
  /** While it signs out. */
  signingOut: string
  /** A person's presence, beside their photo. */
  presenceAvailable: string
  presenceBusy: string
  presenceAway: string
  /** A shortcut recorder with no shortcut. */
  shortcutPlaceholder: string
  /** While it listens, before any key. */
  shortcutPressKeys: string
  /** Its state while it listens, for a screen reader. */
  shortcutRecording: string
  /** Read when it starts listening. */
  shortcutRecordingStarted: string
  /** Under it while it listens. */
  shortcutRecordingHint: string
  /** Read when Escape stops it. */
  shortcutCanceled: string
  /** Read once a shortcut is kept. */
  shortcutSet: (keys: string) => string
  shortcutCleared: string
  /** No shortcut, read aloud. */
  shortcutNone: string
  /** A shortcut without ⌘, Ctrl or Alt. */
  shortcutNeedsModifier: (mac: boolean) => string
  /** Before the action that already has the shortcut. */
  shortcutUsedBy: string
  /** Before what the browser keeps the shortcut for. */
  shortcutReservedFor: string
  /** Read when the shortcut is taken. */
  shortcutConflict: (keys: string, reserved: boolean, label: string) => string
  shortcutUseAnyway: string
  /** Read when the taken shortcut is refused. */
  shortcutKeptPrevious: string
  /** The × that empties a shortcut. */
  shortcutClear: string
  /** The arrow that brings the default back. */
  shortcutReset: (keys: string) => string
  /** Key caps by key id (« enter », « shift »…); missing ones are drawn as typed. */
  shortcutCaps: Readonly<Record<string, string>>
  /** Keys' names read aloud, by key id (« command », « up »…). */
  shortcutSpoken: Readonly<Record<string, string>>
  /** What the browser keeps a shortcut for, by shortcut (« mod+w »). */
  shortcutReserved: Readonly<Record<string, string>>
  // ChangelogFeed and ChangelogEntry (after Arc UI).
  /** The feed's default title. */
  changelogTitle: string
  /** The three kinds of note. */
  changelogNew: string
  changelogImproved: string
  changelogFixed: string
  /** The kind chips' group, for a screen reader. */
  changelogFilter: string
  /** Empties the kind filter. */
  changelogShowAll: string
  /** The word after a count: « mise à jour », « mises à jour ». */
  changelogUpdates: (count: number) => string
  /** After the shown count while a filter is on: « sur 14 mises à jour ». */
  changelogOfTotal: (total: number) => string
  /** Read when the filter changes. */
  changelogShowing: (shown: number, total: number) => string
  /** The month bar's name. */
  changelogMonths: string
  /** A month's button. */
  changelogJumpTo: (month: string) => string
  /** The scrolling list's name. */
  changelogList: string
  /** The month bar when the filter hides everything. */
  changelogNoUpdates: string
  // BlogGrid and BlogCard (after Arc UI).
  /** The category tab that shows every post. */
  blogAll: string
  /** The category tabs' name. */
  blogCategories: string
  /** « 6 min de lecture ». */
  blogReadingTime: (minutes: number) => string
  /** A category without posts. */
  blogEmpty: string
  /** A page number's button. */
  blogPage: (page: number) => string
  // SiteHeader (after Arc UI).
  /** The site header's navigation, for a screen reader. */
  siteNavigation: string
  /** The site header's menu button on a phone. */
  openMenu: string
  closeMenu: string
  // SplitButton, CopyButton, ActionSwap, ThemeToggle (after Arc UI).
  /** A split button's chevron. */
  moreActions: string
  /** A copy button's word when the browser refused the clipboard. */
  copyFailed: string
  /** Read aloud then. */
  copyRefused: string
  /** An action button while its action runs. */
  working: string
  /** An action button once its action failed. */
  tryAgain: string
  /** The one-button theme switch, pressed in dark mode. */
  darkMode: string
  // BillingToggle, BillingPrice and Rating (after Arc UI).
  /** A billing toggle's name, for a screen reader. */
  billingPeriod: string
  /** A billing toggle's two periods. */
  billingMonthly: string
  billingYearly: string
  /** Read before a struck-out former price. */
  billingWasPrice: (price: string) => string
  /** A rating's name when none is given. */
  rating: string
  /** One word per star, for five stars: from the worst to the best. */
  ratingLevels: readonly string[]
  /** A rating with no star yet. */
  ratingNone: string
  /** Said when a rating is cleared. */
  ratingCleared: string
  /** A rating read aloud (« 3,5 sur 5 étoiles »); the value comes written. */
  ratingOf: (value: string, max: number) => string
  // MultiSelectField and ToggleGroup variant="chips" (after Arc UI).
  /** The × that empties a multiple select. */
  clearAll: string
  /** The chip that shows the folded chips of a group (« +4 de plus »). */
  chipsMore: (count: number) => string
  /** The same chip once they show, to fold them back. */
  chipsLess: string
  // ResizableHandle (after Arc UI).
  /** A folded panel's tab on its line: « Afficher Dossiers ». */
  showPanel: (name?: string) => string
  /** Read on the line of a folded panel. */
  panelHidden: (name?: string) => string
  // SignaturePad and SignatureField (after Arc UI).
  /** A signature's name when none is given. */
  signature: string
  /** What the sheet is, for a screen reader. */
  signaturePad: string
  /** On the baseline until the first stroke. */
  signHere: string
  /** How many strokes the sheet holds. */
  signatureSummary: (strokes: number) => string
  /** How to sign on it. */
  signatureDrawHint: string
  /** Its keyboard shortcuts. */
  signatureKeys: string
  /** Its buttons. */
  signatureUndo: string
  signatureRedo: string
  signatureReplay: string
  signatureStopReplay: string
  signatureClear: string
  /** Read after each change. */
  signatureStrokeAdded: (strokes: number) => string
  signatureUndone: string
  signatureRedone: string
  signatureCleared: string
  signatureReplaying: string
  signatureReplayDone: string
  /** The field's two ways to sign, and their group's name. */
  signatureMode: string
  signatureDraw: string
  signatureType: string
  /** In the typed name's field while it is empty. */
  signatureTypedPlaceholder: string
  /** A signature saved earlier, and the way to sign again. */
  savedSignature: string
  signAgain: string
  // FileUpload (after Arc UI).
  /** The zone's words, while waiting and with a file over it. */
  fileUploadTitle: string
  fileUploadHint: string
  fileUploadDrop: string
  fileUploadDropAdd: string
  /** The list's name, for a screen reader. */
  fileUploadList: string
  /** A row's state. */
  fileUploading: string
  fileUploaded: string
  fileFailed: string
  /** Why a file was refused. */
  fileTooLarge: (max: string) => string
  fileTypeRefused: (name: string) => string
  fileTypesRefused: string
  fileTooMany: (max: number) => string
  /** A row's buttons and its bar, for a screen reader. */
  fileRetry: string
  retryFile: (name: string) => string
  removeFile: (name: string) => string
  uploadingFile: (name: string) => string
  /** Read after each change. */
  filesAdded: (count: number) => string
  fileUploadedNamed: (name: string) => string
  fileFailedNamed: (name: string, reason: string) => string
  fileRemoved: (name: string) => string
  fileRetrying: (name: string) => string
  // Calendar, DateRangePicker, ColorPicker (after Arc UI).
  /** Calendar's « Today » button. */
  today: string
  /** Its name, with today in full. */
  todayLabel: (day: string) => string
  /**
   * What a calendar day says after its number, for a screen reader:
   * « juin 2027, lundi, aujourd’hui, sélectionné ».
   */
  calendarDayRest: (day: {
    monthYear: string
    weekday: string
    today: boolean
    selected: boolean
  }) => string
  /** A period's length under the months: « 3 jours ». */
  dayCount: (count: number) => string
  /** Once a period's first day is picked. */
  pickEndDate: string
  /** A colour picker's default name. */
  colorPickerLabel: string
  /** The colour panel's name. */
  colorPanel: (label: string) => string
  /** The saturation and brightness area, its kind and its values. */
  colorArea: string
  colorAreaRole: string
  colorAreaValue: (saturation: number, brightness: number) => string
  colorHue: string
  colorHueValue: (degrees: number) => string
  colorOpacity: string
  /** The button that changes how the colour is written. */
  colorFormat: (format: string) => string
  /** The typed colour's field. */
  colorIn: (label: string, format: string) => string
  colorInvalid: string
  colorEyedropper: string
  /** After the contrast ratio. */
  colorContrastWith: string
  /** A WCAG level, in words. */
  contrastGrade: (grade: 'AAA' | 'AA' | 'AA large' | 'fail') => string
  /** The contrast, read aloud. */
  contrastRead: (ratio: string, grade: string, passes: boolean) => string
  /** The saved colours: save, their list, one of them. */
  colorSave: (hex: string) => string
  colorSaved: string
  colorSwatch: (color: string) => string
  // NumberField, MoneyField, PhoneField (lot 3).
  /** A number field's limit, shown a moment when a press meets it. */
  numberMin: (limit: string) => string
  numberMax: (limit: string) => string
  /** Read aloud when a press meets a limit. */
  numberAtMin: (value: string) => string
  numberAtMax: (value: string) => string
  /** An amount's range, under the field. */
  moneyUpTo: (amount: string) => string
  moneyAtLeast: (amount: string) => string
  moneyBetween: (min: string, max: string) => string
  /** A quick-add chip, for a screen reader, and their group. */
  moneyAdd: (amount: string) => string
  moneyQuickAdd: string
  /** The country button, for a screen reader. */
  phoneCountry: (country: string, dial: string) => string
  /** The country search: its name and its empty shape. */
  phoneSearch: string
  phoneSearchPlaceholder: string
  /** The list's sections, its name and its close button. */
  phoneSuggested: string
  phoneAllCountries: string
  phoneCountries: string
  phoneCloseList: string
  /** A search that finds no country, and how many it finds. */
  phoneNoCountry: (query: string) => string
  phoneCountryCount: (count: number) => string
  /** Read when a pasted number picks its country. */
  phoneCountrySet: (country: string) => string
  /** Under a number too short or too long. */
  phoneDigits: (country: string, lengths: number[]) => string
  /** Read once a number has its length. */
  phoneValid: (country: string) => string
  // Sparkline, Gauge, BarChart, LineChart, DonutChart, ActivityHeatmap (after Arc UI).
  /** A chart's explorer (a slider), for a screen reader. */
  chartExplore: (label: string) => string
  /** A name and its reading: « Mars : 18 400 € ». */
  chartReading: (label: string, value: string) => string
  /** A reading's place when it has no label of its own. */
  chartPointOf: (index: number, total: number) => string
  /** The reading at rest: the latest one. */
  chartLatest: string
  /** A gauge's value against its maximum. */
  chartOutOf: (value: string, max: string) => string
  /** A bar chart's average: the headline's word, then its line's label. */
  chartAverage: string
  chartAverageShort: string
  /** The headline's word while a bar is explored. */
  chartValue: string
  /** The first column of a chart's table: what each reading is. */
  chartPeriod: string
  /** A chart's summary: its highest and lowest readings. */
  chartHighest: (label: string, value: string) => string
  chartLowest: (label: string, value: string) => string
  /** A chart with nothing to draw. */
  chartNoData: string
  /** A line chart's series switches: their group's name. */
  chartSeriesGroup: (label: string) => string
  /** How many series are drawn. */
  chartSeriesShown: (shown: number, total: number) => string
  /** Every series hidden. */
  chartChooseSeries: string
  /** A line chart's summary: its span, then each series' latest value. */
  chartSpan: (label: string, from: string, to: string) => string
  chartLatestOf: (series: string, value: string) => string
  /** A donut's whole, and the segment that gathers the small parts. */
  chartTotal: string
  chartOther: string
  /** A segment's share of the whole. */
  chartShareOfTotal: (share: string) => string
  /** The parts gathered in « Autres ». */
  chartIncludes: (names: string) => string
  /** « Mariage, Séminaire et 2 de plus ». */
  chartAndMore: (names: string, count: number) => string
  /** Read when a segment is shown or hidden. */
  chartToggled: (label: string, shown: boolean, total: string) => string
  /** A hidden segment's legend row. */
  chartHiddenItem: (label: string) => string
  /** A donut's legend: its name, and what pressing a row does. */
  chartSegments: (label: string, toggles: boolean) => string
  /** A donut without legend, for a screen reader. */
  chartRingHint: (label: string) => string
  /** A donut table's columns. */
  chartSegment: string
  chartShare: string
  /** A level of a scale: from–to, and the last one's « or more ». */
  chartRange: (from: string, to: string) => string
  chartOrMore: (value: string) => string
  /** An ActivityHeatmap's default unit, one and several. */
  heatmapUnit: { one: string; other: string }
  /** The two ends of a heatmap's scale. */
  heatmapLess: string
  heatmapMore: string
  /** A scale button, and the buttons' group. */
  heatmapHighlight: (range: string) => string
  heatmapLevels: string
  /** How many days sit at the highlighted level. */
  heatmapDays: (count: number, formatted: string) => string
  heatmapDaysWith: (days: string, range: string) => string
  /** How a heatmap reads, for a screen reader. */
  heatmapLegend: (levels: string) => string
  // Streamgraph, BrushChart, Ridgeline, Treemap, WaffleChart, SlopeChart (after Arc UI).
  /** Each chart's kind, for a screen reader (aria-roledescription). */
  streamgraphRole: string
  brushRole: string
  ridgelineRole: string
  treemapRole: string
  waffleRole: string
  slopeRole: string
  /** How to explore each chart with the keyboard. */
  streamgraphKeys: string
  brushKeys: string
  ridgelineKeys: string
  treemapKeys: string
  waffleKeys: (cells: number) => string
  slopeKeys: (order: string) => string
  /** A waffle chart's legend, and its table's columns. */
  chartCategories: (label: string) => string
  chartCategory: string
  waffleCells: string
  /** A brush chart's window: its slider, its edges, and what it shows. */
  brushWindow: (label: string) => string
  brushWindowRole: string
  brushWindowStart: string
  brushWindowEnd: string
  brushShowing: (range: string) => string
  /** A brush chart's tooltip: the week's average, the change from a week before. */
  brushAverage: (value: string) => string
  brushVsWeek: (change: string) => string
  /** A brush chart table's columns. */
  brushDate: string
  brushEvent: string
  /** A ridge's figures, and the share at or below a value. */
  ridgelineMedian: string
  ridgelineMiddle: string
  ridgelineSpread: string
  ridgelineAtOrBelow: (share: string, value: string) => string
  ridgelineDescribe: (
    label: string,
    median: string,
    middle: string,
    spread: string,
    count: number,
  ) => string
  /** A ridgeline table's columns. */
  ridgelineSeries: string
  ridgelineFirstQuartile: string
  ridgelineThirdQuartile: string
  ridgelineLowest: string
  ridgelineHighest: string
  ridgelineCount: string
  /** A treemap's breadcrumb, a tile's share of its parent, its table's columns. */
  treemapPath: (label: string) => string
  treemapShareOf: (share: string, parent: string) => string
  treemapPathColumn: string
  treemapShareColumn: string
  /** A slope chart's rank change, and its table's columns. */
  slopeRankSame: string
  slopeRankUp: (places: number, rank: number) => string
  slopeRankDown: (places: number, rank: number) => string
  slopeRankMove: (from: number, to: number) => string
  slopeItem: string
  slopeChange: string
  slopeRank: string
}

export type GoGoUILocale = 'fr' | 'en'

/**
 * Both languages GoGoUI ships, by locale. Kept for older imports: a project
 * that speaks one language imports it alone
 * (`import { en } from '@gogoui/ui/locales/en'`).
 */
export const messages: Record<GoGoUILocale, GoGoUIMessages> = { fr, en }
