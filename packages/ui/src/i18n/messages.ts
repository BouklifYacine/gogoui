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
    decrease: 'Diminuer',
    increase: 'Augmenter',
    trendUp: (change) => `en hausse de ${change}`,
    trendDown: (change) => `en baisse de ${change}`,
    trendFlat: 'stable',
    theme: 'Thème',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    themeSystem: 'Système',
    presetToday: 'Aujourd’hui',
    presetLast7Days: '7 derniers jours',
    presetLast30Days: '30 derniers jours',
    presetThisMonth: 'Ce mois-ci',
    presetLastMonth: 'Le mois dernier',
    presetNext30Days: '30 prochains jours',
    presets: 'Raccourcis',
    charactersLeft: (count) =>
      count > 0
        ? `Encore ${count} caractère${count > 1 ? 's' : ''}`
        : 'Limite atteinte',
    carousel: 'Carrousel',
    previousSlide: 'Diapositive précédente',
    nextSlide: 'Diapositive suivante',
    slideOf: (current, total) => `${current} sur ${total}`,
    bold: 'Gras',
    italic: 'Italique',
    strike: 'Barré',
    bulletList: 'Liste à puces',
    orderedList: 'Liste numérotée',
    heading: 'Titre',
    quote: 'Citation',
    undo2: 'Annuler la frappe',
    redo: 'Rétablir',
    formatting: 'Mise en forme',
    // Fields, PasswordStrength, TagInput, MentionInput, ExpandableText (after Arc UI).
    passwordMeter: 'Force du mot de passe',
    passwordEmpty: 'Aucun mot de passe',
    passwordRules: 'Conditions du mot de passe',
    passwordRuleMet: ', remplie',
    passwordRuleNotMet: ', non remplie',
    passwordRuleMin: (count) => `Au moins ${count} caractères`,
    passwordRuleLength: (count) => `${count} caractères ou plus`,
    passwordRuleKinds:
      'Trois sortes : minuscules, majuscules, chiffres, symboles',
    passwordRemaining: (count) => `encore ${count}`,
    tagAdded: (tag) => `« ${tag} » ajouté`,
    tagRemoved: (tag) => `« ${tag} » retiré`,
    tagDuplicate: (tag) => `« ${tag} » est déjà dans la liste`,
    tagSelected: (tag) =>
      `« ${tag} » sélectionné. Retour arrière pour le retirer.`,
    removeTag: (tag) => `Retirer ${tag}`,
    tagLimit: (max) => `${max} au plus`,
    mentionPeople: 'Personnes',
    mentionCount: (count) => `${count} personne${count > 1 ? 's' : ''}`,
    mentionNoMatch: (query) => `Aucune personne ne correspond à « ${query} »`,
    readMore: 'Lire la suite',
    showLess: 'Réduire',
    // HoldToConfirm, UserMenu, ShortcutRecorder (after Arc UI).
    holdHint: (seconds) =>
      `Maintenez le bouton appuyé ${seconds} s pour confirmer. Au clavier, maintenez Espace ou Entrée.`,
    accountMenu: (name) => `Menu du compte, ${name}`,
    signOut: 'Se déconnecter',
    signingOut: 'Déconnexion…',
    presenceAvailable: 'Disponible',
    presenceBusy: 'Occupé',
    presenceAway: 'Absent',
    shortcutPlaceholder: 'Enregistrer un raccourci',
    shortcutPressKeys: 'Appuyez sur les touches',
    shortcutRecording: 'Enregistrement',
    shortcutRecordingStarted:
      'Enregistrement. Appuyez sur le nouveau raccourci, ou sur Échap pour annuler.',
    shortcutRecordingHint: 'Échap pour annuler, Retour arrière pour effacer',
    shortcutCanceled: 'Enregistrement annulé',
    shortcutSet: (keys) => `Raccourci : ${keys}`,
    shortcutCleared: 'Raccourci effacé',
    shortcutNone: 'aucun',
    shortcutNeedsModifier: (mac) =>
      mac ? 'Ajoutez ⌘, ⌃ ou ⌥' : 'Ajoutez Ctrl ou Alt',
    shortcutUsedBy: 'Déjà utilisé par',
    shortcutReservedFor: 'Réservé à',
    shortcutConflict: (keys, reserved, label) =>
      `${keys} est ${reserved ? 'réservé à' : 'déjà utilisé par'} ${label}. Utilisez-le quand même, ou enregistrez-en un autre.`,
    shortcutUseAnyway: 'Utiliser quand même',
    shortcutKeptPrevious: 'Raccourci précédent conservé',
    shortcutClear: 'Effacer le raccourci',
    shortcutReset: (keys) => `Revenir à ${keys}`,
    shortcutCaps: {
      ctrl: 'Ctrl',
      alt: 'Alt',
      shift: 'Maj',
      win: 'Win',
      space: 'Espace',
      enter: 'Entrée',
      escape: 'Échap',
      backspace: 'Retour',
      delete: 'Suppr',
      tab: 'Tab',
      home: 'Début',
      end: 'Fin',
      pageup: 'Pg préc',
      pagedown: 'Pg suiv',
    },
    shortcutSpoken: {
      command: 'Commande',
      option: 'Option',
      ctrl: 'Contrôle',
      alt: 'Alt',
      shift: 'Majuscule',
      win: 'Windows',
      space: 'Espace',
      enter: 'Entrée',
      escape: 'Échap',
      backspace: 'Retour arrière',
      delete: 'Supprimer',
      tab: 'Tabulation',
      up: 'Flèche haut',
      down: 'Flèche bas',
      left: 'Flèche gauche',
      right: 'Flèche droite',
      home: 'Début',
      end: 'Fin',
      pageup: 'Page précédente',
      pagedown: 'Page suivante',
      ',': 'Virgule',
      '.': 'Point',
      '/': 'Barre oblique',
      ';': 'Point-virgule',
      "'": 'Apostrophe',
      '[': 'Crochet ouvrant',
      ']': 'Crochet fermant',
      '\\': 'Barre oblique inversée',
      '-': 'Moins',
      '=': 'Égal',
      '`': 'Accent grave',
    },
    shortcutReserved: {
      'mod+w': 'Fermer l’onglet',
      'mod+t': 'Nouvel onglet',
      'mod+n': 'Nouvelle fenêtre',
      'mod+q': 'Quitter',
      'mod+l': 'Barre d’adresse',
      'mod+r': 'Recharger',
      'mod+shift+t': 'Rouvrir l’onglet',
      'mod+c': 'Copier',
      'mod+v': 'Coller',
      'mod+x': 'Couper',
      'mod+z': 'Annuler',
      'mod+a': 'Tout sélectionner',
    },
    // ChangelogFeed and ChangelogEntry.
    changelogTitle: 'Nouveautés',
    changelogNew: 'Nouveau',
    changelogImproved: 'Amélioré',
    changelogFixed: 'Corrigé',
    changelogFilter: 'Filtrer par type',
    changelogShowAll: 'Tout afficher',
    changelogUpdates: (count) => (count > 1 ? 'mises à jour' : 'mise à jour'),
    changelogOfTotal: (total) =>
      `sur ${total} mise${total > 1 ? 's' : ''} à jour`,
    changelogShowing: (shown, total) =>
      shown === total
        ? `${total} mise${total > 1 ? 's' : ''} à jour affichée${total > 1 ? 's' : ''}`
        : `${shown} sur ${total} mises à jour affichées`,
    changelogMonths: 'Aller au mois',
    changelogJumpTo: (month) => `Aller à ${month}`,
    changelogList: 'Notes de version',
    changelogNoUpdates: 'Aucune mise à jour',
    // BlogGrid and BlogCard.
    blogAll: 'Tous',
    blogCategories: 'Catégories d’articles',
    blogReadingTime: (minutes) => `${minutes} min de lecture`,
    blogEmpty: 'Aucun article dans cette catégorie pour l’instant.',
    blogPage: (page) => `Page ${page}`,
    // SiteHeader.
    siteNavigation: 'Navigation principale',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    // SplitButton, CopyButton, ActionSwap, ThemeToggle.
    moreActions: 'Plus d’actions',
    copyFailed: 'Échec',
    copyRefused: 'Copie impossible',
    working: 'En cours…',
    tryAgain: 'Réessayer',
    darkMode: 'Mode sombre',
    // BillingToggle, BillingPrice and Rating (after Arc UI).
    billingPeriod: 'Période de facturation',
    billingMonthly: 'Mensuel',
    billingYearly: 'Annuel',
    billingWasPrice: (price) => `au lieu de ${price}`,
    rating: 'Note',
    ratingLevels: ['Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'],
    ratingNone: 'Pas de note',
    ratingCleared: 'Note effacée',
    ratingOf: (value, max) => `${value} sur ${max} étoiles`,
    // MultiSelectField and ToggleGroup variant="chips" (after Arc UI).
    clearAll: 'Tout effacer',
    chipsMore: (count) => `+${count} de plus`,
    chipsLess: 'Voir moins',
    // ResizableHandle (after Arc UI).
    showPanel: (name) => (name ? `Afficher ${name}` : 'Afficher le volet'),
    panelHidden: (name) => `${name ?? 'Volet'} masqué, Entrée pour l’afficher`,
    // SignaturePad and SignatureField (after Arc UI).
    signature: 'Signature',
    signaturePad: 'zone de signature',
    signHere: 'Signez ici',
    signatureSummary: (strokes) =>
      strokes > 0 ? `${strokes} trait${strokes > 1 ? 's' : ''}.` : 'Vide.',
    signatureDrawHint: 'Signez avec la souris, un stylet ou le doigt.',
    signatureKeys:
      'Ctrl ou Cmd + Z annule, avec Maj rétablit, Suppr efface la signature.',
    signatureUndo: 'Annuler le trait',
    signatureRedo: 'Rétablir le trait',
    signatureReplay: 'Rejouer la signature',
    signatureStopReplay: 'Arrêter',
    signatureClear: 'Effacer la signature',
    signatureStrokeAdded: (strokes) => `Trait ajouté, ${strokes} au total.`,
    signatureUndone: 'Trait annulé.',
    signatureRedone: 'Trait rétabli.',
    signatureCleared: 'Signature effacée. Ctrl + Z la ramène.',
    signatureReplaying: 'Lecture de la signature.',
    signatureReplayDone: 'Lecture terminée.',
    signatureMode: 'Façon de signer',
    signatureDraw: 'Dessiner',
    signatureType: 'Écrire mon nom',
    signatureTypedPlaceholder: 'Prénom et nom',
    savedSignature: 'Signature enregistrée',
    signAgain: 'Signer à nouveau',
    // FileUpload (after Arc UI).
    fileUploadTitle: 'Ajoutez des fichiers',
    fileUploadHint: 'Glissez-les ici ou choisissez-les sur l’appareil',
    fileUploadDrop: 'Déposez pour envoyer',
    fileUploadDropAdd: 'Déposez pour ajouter',
    fileUploadList: 'Fichiers',
    fileUploading: 'Envoi',
    fileUploaded: 'Envoyé',
    fileFailed: 'Échec de l’envoi',
    fileTooLarge: (max) => `Plus lourd que ${max}`,
    fileTypeRefused: (name) => `${name} n’est pas d’un type accepté.`,
    fileTypesRefused:
      'Certains fichiers n’ont pas été ajoutés : leur type n’est pas accepté.',
    fileTooMany: (max) => `${max} fichier${max > 1 ? 's' : ''} au plus.`,
    fileRetry: 'Réessayer',
    retryFile: (name) => `Réessayer ${name}`,
    removeFile: (name) => `Retirer ${name}`,
    uploadingFile: (name) => `Envoi de ${name}`,
    filesAdded: (count) =>
      `${count} fichier${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''}.`,
    fileUploadedNamed: (name) => `${name} envoyé.`,
    fileFailedNamed: (name, reason) => `${name} : ${reason}.`,
    fileRemoved: (name) => `${name} retiré.`,
    fileRetrying: (name) => `Nouvel essai pour ${name}.`,
    // Calendar, DateRangePicker, ColorPicker (after Arc UI).
    today: 'Aujourd’hui',
    todayLabel: (day) => `Aujourd’hui, ${day}`,
    dayCount: (count) => (count > 1 ? `${count} jours` : '1 jour'),
    pickEndDate: 'Choisissez la date de fin',
    colorPickerLabel: 'Couleur',
    colorPanel: (label) => `Couleur « ${label} »`,
    colorArea: 'Saturation et luminosité',
    colorAreaRole: 'zone 2D',
    colorAreaValue: (saturation, brightness) =>
      `Saturation ${saturation} %, luminosité ${brightness} %`,
    colorHue: 'Teinte',
    colorHueValue: (degrees) => `${degrees} degrés`,
    colorOpacity: 'Opacité',
    colorFormat: (format) => `Format ${format}, changer de format`,
    colorIn: (label, format) => `${label} en ${format}`,
    colorInvalid: 'Saisissez une couleur en HEX, RGB, HSL ou OKLCH.',
    colorEyedropper: 'Prendre une couleur à l’écran',
    colorContrastWith: 'sur le fond',
    contrastGrade: (grade) =>
      grade === 'fail'
        ? 'Insuffisant'
        : grade === 'AA large'
          ? 'AA grand texte'
          : grade,
    contrastRead: (ratio, grade, passes) =>
      `Contraste de ${ratio} pour 1 sur le fond : ${passes ? `niveau ${grade}` : 'insuffisant'}.`,
    colorSave: (hex) => `Enregistrer ${hex}`,
    colorSaved: 'Couleurs enregistrées',
    colorSwatch: (color) =>
      `${color}. Alt et flèches pour déplacer, Suppr pour retirer.`,
    // NumberField, MoneyField, PhoneField (lot 3).
    numberMin: (limit) => `Min ${limit}`,
    numberMax: (limit) => `Max ${limit}`,
    numberAtMin: (value) => `${value}, minimum`,
    numberAtMax: (value) => `${value}, maximum`,
    moneyUpTo: (amount) => `Jusqu’à ${amount}`,
    moneyAtLeast: (amount) => `Au moins ${amount}`,
    moneyBetween: (min, max) => `De ${min} à ${max}`,
    moneyAdd: (amount) => `Ajouter ${amount}`,
    moneyQuickAdd: 'Ajout rapide',
    phoneCountry: (country, dial) => `Pays : ${country} +${dial}`,
    phoneSearch: 'Rechercher un pays ou un indicatif',
    phoneSearchPlaceholder: 'Pays ou indicatif',
    phoneSuggested: 'Suggestions',
    phoneAllCountries: 'Tous les pays',
    phoneCountries: 'Pays',
    phoneCloseList: 'Fermer la liste des pays',
    phoneNoCountry: (query) => `Aucun pays pour « ${query} »`,
    phoneCountryCount: (count) => `${count} pays`,
    phoneCountrySet: (country) => `Pays : ${country}`,
    phoneDigits: (country, lengths) =>
      `${country} : ${
        lengths.length > 1
          ? `${lengths.slice(0, -1).join(', ')} ou ${lengths[lengths.length - 1]}`
          : lengths[0]
      } chiffres attendus`,
    phoneValid: (country) => `Numéro valide (${country})`,
    // Sparkline, Gauge, BarChart, LineChart, DonutChart, ActivityHeatmap (after Arc UI).
    chartExplore: (label) => `${label} : parcourir les valeurs`,
    chartReading: (label, value) => `${label} : ${value}`,
    chartPointOf: (index, total) => `Point ${index} sur ${total}`,
    chartLatest: 'Dernière valeur',
    chartOutOf: (value, max) => `${value} sur ${max}`,
    chartAverage: 'Moyenne',
    chartAverageShort: 'Moy.',
    chartValue: 'Valeur',
    chartPeriod: 'Période',
    chartHighest: (label, value) => `Le plus haut : ${label}, ${value}.`,
    chartLowest: (label, value) => `Le plus bas : ${label}, ${value}.`,
    chartNoData: 'Aucune donnée pour cette période',
    chartSeriesGroup: (label) => `Séries de « ${label} »`,
    chartSeriesShown: (shown, total) =>
      `${shown} série${shown > 1 ? 's' : ''} sur ${total} affichée${shown > 1 ? 's' : ''}`,
    chartChooseSeries: 'Choisissez une série à afficher',
    chartSpan: (label, from, to) => `${label}, de ${from} à ${to}.`,
    chartLatestOf: (series, value) => `${series}, dernière valeur ${value}`,
    chartTotal: 'Total',
    chartOther: 'Autres',
    chartShareOfTotal: (share) => `${share} du total`,
    chartIncludes: (names) => `Comprend ${names}`,
    chartAndMore: (names, count) => `${names} et ${count} de plus`,
    chartToggled: (label, shown, total) =>
      `${label} ${shown ? 'affiché' : 'masqué'}. Total : ${total}.`,
    chartHiddenItem: (label) => `${label}, masqué`,
    chartSegments: (label, toggles) =>
      `${label}, parts${toggles ? ". Appuyez sur une part pour l'afficher ou la masquer" : ''}`,
    chartRingHint: (label) => `${label}. Lisez chaque part avec les flèches.`,
    chartSegment: 'Part',
    chartShare: 'Pourcentage',
    chartRange: (from, to) => `${from} à ${to}`,
    chartOrMore: (value) => `${value} ou plus`,
    heatmapUnit: { one: 'activité', other: 'activités' },
    heatmapLess: 'Moins',
    heatmapMore: 'Plus',
    heatmapHighlight: (range) => `Mettre en avant les jours avec ${range}`,
    heatmapLevels: 'Mettre en avant les jours par niveau',
    heatmapDays: (count, formatted) =>
      `${formatted} jour${count > 1 ? 's' : ''}`,
    heatmapDaysWith: (days, range) => `${days} avec ${range}`,
    heatmapLegend: (levels) =>
      `Plus la case est foncée, plus le nombre est élevé. Niveaux : ${levels}.`,
    // Streamgraph, BrushChart, Ridgeline, Treemap, WaffleChart, SlopeChart (after Arc UI).
    streamgraphRole: 'graphique en flux',
    brushRole: 'graphique chronologique',
    ridgelineRole: 'graphique en crêtes',
    treemapRole: 'carte proportionnelle',
    waffleRole: 'graphique en gaufre',
    slopeRole: 'graphique de pente',
    streamgraphKeys:
      'Flèches gauche et droite : se déplacer dans le temps. Haut et bas : changer de série.',
    brushKeys:
      'Flèches gauche et droite : lire chaque jour. Double-clic : tout afficher.',
    ridgelineKeys:
      'Flèches haut et bas : choisir une crête. Gauche et droite : parcourir les valeurs.',
    treemapKeys:
      "Flèches : aller d'une tuile à l'autre. Entrée : zoomer. Échap : revenir.",
    waffleKeys: (cells) =>
      `${cells} cases. Flèches : aller d'une case à l'autre. Page précédente et Page suivante : changer de catégorie.`,
    slopeKeys: (order) =>
      `Flèches haut et bas : aller d'un élément à l'autre, dans l'ordre de ${order}.`,
    chartCategories: (label) => `Catégories de « ${label} »`,
    chartCategory: 'Catégorie',
    waffleCells: 'Cases',
    brushWindow: (label) => `Fenêtre de « ${label} »`,
    brushWindowRole: 'fenêtre de dates',
    brushWindowStart: 'Début de la fenêtre',
    brushWindowEnd: 'Fin de la fenêtre',
    brushShowing: (range) => `Affiché : ${range}`,
    brushAverage: (value) => `${value} en moyenne sur 7 jours`,
    brushVsWeek: (change) => `${change} par rapport à la semaine précédente`,
    brushDate: 'Date',
    brushEvent: 'Événement',
    ridgelineMedian: 'Médiane',
    ridgelineMiddle: 'Moitié centrale',
    ridgelineSpread: 'Étendue',
    ridgelineAtOrBelow: (share, value) => `${share} à ${value} ou moins`,
    ridgelineDescribe: (label, median, middle, spread, count) =>
      `${label} : médiane ${median}, moitié centrale de ${middle}, étendue de ${spread}, ${count} valeur${count > 1 ? 's' : ''}`,
    ridgelineSeries: 'Série',
    ridgelineFirstQuartile: 'Premier quartile',
    ridgelineThirdQuartile: 'Troisième quartile',
    ridgelineLowest: 'Minimum',
    ridgelineHighest: 'Maximum',
    ridgelineCount: 'Nombre de valeurs',
    treemapPath: (label) => `Chemin dans « ${label} »`,
    treemapShareOf: (share, parent) => `${share} de ${parent}`,
    treemapPathColumn: 'Chemin',
    treemapShareColumn: 'Part du parent',
    slopeRankSame: 'même rang',
    slopeRankUp: (places, rank) =>
      `gagne ${places} place${places > 1 ? 's' : ''}, ${rank === 1 ? '1er' : `${rank}e`}`,
    slopeRankDown: (places, rank) =>
      `perd ${places} place${places > 1 ? 's' : ''}, ${rank}e`,
    slopeRankMove: (from, to) =>
      `${from === 1 ? '1er' : `${from}e`} → ${to === 1 ? '1er' : `${to}e`}`,
    slopeItem: 'Élément',
    slopeChange: 'Évolution',
    slopeRank: 'Rang',
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
    decrease: 'Decrease',
    increase: 'Increase',
    trendUp: (change) => `up ${change}`,
    trendDown: (change) => `down ${change}`,
    trendFlat: 'unchanged',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    presetToday: 'Today',
    presetLast7Days: 'Last 7 days',
    presetLast30Days: 'Last 30 days',
    presetThisMonth: 'This month',
    presetLastMonth: 'Last month',
    presetNext30Days: 'Next 30 days',
    presets: 'Shortcuts',
    charactersLeft: (count) =>
      count > 0
        ? `${count} character${count > 1 ? 's' : ''} left`
        : 'Limit reached',
    carousel: 'Carousel',
    previousSlide: 'Previous slide',
    nextSlide: 'Next slide',
    slideOf: (current, total) => `${current} of ${total}`,
    bold: 'Bold',
    italic: 'Italic',
    strike: 'Strikethrough',
    bulletList: 'Bulleted list',
    orderedList: 'Numbered list',
    heading: 'Heading',
    quote: 'Quote',
    undo2: 'Undo',
    redo: 'Redo',
    formatting: 'Formatting',
    // Fields, PasswordStrength, TagInput, MentionInput, ExpandableText (after Arc UI).
    passwordMeter: 'Password strength',
    passwordEmpty: 'No password yet',
    passwordRules: 'Password conditions',
    passwordRuleMet: ', met',
    passwordRuleNotMet: ', not met',
    passwordRuleMin: (count) => `At least ${count} characters`,
    passwordRuleLength: (count) => `${count} characters or more`,
    passwordRuleKinds: 'Three kinds: lowercase, uppercase, digits, symbols',
    passwordRemaining: (count) => `${count} more`,
    tagAdded: (tag) => `Added ${tag}`,
    tagRemoved: (tag) => `Removed ${tag}`,
    tagDuplicate: (tag) => `${tag} is already added`,
    tagSelected: (tag) => `${tag} selected. Press Backspace to remove it.`,
    removeTag: (tag) => `Remove ${tag}`,
    tagLimit: (max) => `${max} at most`,
    mentionPeople: 'People',
    mentionCount: (count) => `${count} ${count === 1 ? 'person' : 'people'}`,
    mentionNoMatch: (query) => `No one matches “${query}”`,
    readMore: 'Read more',
    showLess: 'Show less',
    // HoldToConfirm, UserMenu, ShortcutRecorder (after Arc UI).
    holdHint: (seconds) =>
      `Press and hold for ${seconds} s to confirm. With a keyboard, hold Space or Enter.`,
    accountMenu: (name) => `Account menu, ${name}`,
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    presenceAvailable: 'Available',
    presenceBusy: 'Busy',
    presenceAway: 'Away',
    shortcutPlaceholder: 'Record a shortcut',
    shortcutPressKeys: 'Press keys',
    shortcutRecording: 'Recording',
    shortcutRecordingStarted:
      'Recording. Press the new shortcut, or Escape to cancel.',
    shortcutRecordingHint: 'Esc to cancel, Backspace to clear',
    shortcutCanceled: 'Recording canceled',
    shortcutSet: (keys) => `Shortcut set to ${keys}`,
    shortcutCleared: 'Shortcut cleared',
    shortcutNone: 'none',
    shortcutNeedsModifier: (mac) =>
      mac ? 'Include ⌘, ⌃ or ⌥' : 'Include Ctrl or Alt',
    shortcutUsedBy: 'Already used by',
    shortcutReservedFor: 'Reserved for',
    shortcutConflict: (keys, reserved, label) =>
      `${keys} is ${reserved ? 'reserved for' : 'used by'} ${label}. Use it anyway, or record another.`,
    shortcutUseAnyway: 'Use anyway',
    shortcutKeptPrevious: 'Kept the previous shortcut',
    shortcutClear: 'Clear the shortcut',
    shortcutReset: (keys) => `Reset to ${keys}`,
    shortcutCaps: {
      ctrl: 'Ctrl',
      alt: 'Alt',
      shift: 'Shift',
      win: 'Win',
      space: 'Space',
      enter: 'Enter',
      escape: 'Esc',
      backspace: 'Backspace',
      delete: 'Del',
      tab: 'Tab',
      home: 'Home',
      end: 'End',
      pageup: 'PgUp',
      pagedown: 'PgDn',
    },
    shortcutSpoken: {
      command: 'Command',
      option: 'Option',
      ctrl: 'Control',
      alt: 'Alt',
      shift: 'Shift',
      win: 'Windows',
      space: 'Space',
      enter: 'Enter',
      escape: 'Escape',
      backspace: 'Backspace',
      delete: 'Delete',
      tab: 'Tab',
      up: 'Up arrow',
      down: 'Down arrow',
      left: 'Left arrow',
      right: 'Right arrow',
      home: 'Home',
      end: 'End',
      pageup: 'Page up',
      pagedown: 'Page down',
      ',': 'Comma',
      '.': 'Period',
      '/': 'Slash',
      ';': 'Semicolon',
      "'": 'Quote',
      '[': 'Left bracket',
      ']': 'Right bracket',
      '\\': 'Backslash',
      '-': 'Minus',
      '=': 'Equals',
      '`': 'Backtick',
    },
    shortcutReserved: {
      'mod+w': 'Close tab',
      'mod+t': 'New tab',
      'mod+n': 'New window',
      'mod+q': 'Quit',
      'mod+l': 'Address bar',
      'mod+r': 'Reload',
      'mod+shift+t': 'Reopen tab',
      'mod+c': 'Copy',
      'mod+v': 'Paste',
      'mod+x': 'Cut',
      'mod+z': 'Undo',
      'mod+a': 'Select all',
    },
    // ChangelogFeed and ChangelogEntry.
    changelogTitle: 'What’s new',
    changelogNew: 'New',
    changelogImproved: 'Improved',
    changelogFixed: 'Fixed',
    changelogFilter: 'Filter by type',
    changelogShowAll: 'Show all',
    changelogUpdates: (count) => (count === 1 ? 'update' : 'updates'),
    changelogOfTotal: (total) => `of ${total} update${total === 1 ? '' : 's'}`,
    changelogShowing: (shown, total) =>
      shown === total
        ? `Showing ${total} update${total === 1 ? '' : 's'}`
        : `Showing ${shown} of ${total} updates`,
    changelogMonths: 'Jump to month',
    changelogJumpTo: (month) => `Jump to ${month}`,
    changelogList: 'Release notes',
    changelogNoUpdates: 'No updates',
    // BlogGrid and BlogCard.
    blogAll: 'All',
    blogCategories: 'Post categories',
    blogReadingTime: (minutes) => `${minutes} min read`,
    blogEmpty: 'No posts in this category yet.',
    blogPage: (page) => `Page ${page}`,
    // SiteHeader.
    siteNavigation: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    // SplitButton, CopyButton, ActionSwap, ThemeToggle.
    moreActions: 'More actions',
    copyFailed: 'Failed',
    copyRefused: 'Could not copy',
    working: 'Working…',
    tryAgain: 'Try again',
    darkMode: 'Dark mode',
    // BillingToggle, BillingPrice and Rating (after Arc UI).
    billingPeriod: 'Billing period',
    billingMonthly: 'Monthly',
    billingYearly: 'Yearly',
    billingWasPrice: (price) => `instead of ${price}`,
    rating: 'Rating',
    ratingLevels: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
    ratingNone: 'No rating',
    ratingCleared: 'Rating cleared',
    ratingOf: (value, max) => `${value} out of ${max} stars`,
    // MultiSelectField and ToggleGroup variant="chips" (after Arc UI).
    clearAll: 'Clear all',
    chipsMore: (count) => `+${count} more`,
    chipsLess: 'Show less',
    // ResizableHandle (after Arc UI).
    showPanel: (name) => (name ? `Show ${name}` : 'Show the panel'),
    panelHidden: (name) => `${name ?? 'Panel'} hidden, press Enter to show it`,
    // SignaturePad and SignatureField (after Arc UI).
    signature: 'Signature',
    signaturePad: 'signature pad',
    signHere: 'Sign here',
    signatureSummary: (strokes) =>
      strokes > 0 ? `${strokes} stroke${strokes > 1 ? 's' : ''}.` : 'Empty.',
    signatureDrawHint: 'Sign with a mouse, a pen or a finger.',
    signatureKeys:
      'Control or Command Z undoes, add Shift to redo, Delete clears the signature.',
    signatureUndo: 'Undo the stroke',
    signatureRedo: 'Redo the stroke',
    signatureReplay: 'Replay the signature',
    signatureStopReplay: 'Stop',
    signatureClear: 'Clear the signature',
    signatureStrokeAdded: (strokes) => `Stroke added, ${strokes} in all.`,
    signatureUndone: 'Stroke undone.',
    signatureRedone: 'Stroke redone.',
    signatureCleared: 'Signature cleared. Control Z brings it back.',
    signatureReplaying: 'Replaying the signature.',
    signatureReplayDone: 'Replay finished.',
    signatureMode: 'How to sign',
    signatureDraw: 'Draw',
    signatureType: 'Type my name',
    signatureTypedPlaceholder: 'First and last name',
    savedSignature: 'Saved signature',
    signAgain: 'Sign again',
    // FileUpload (after Arc UI).
    fileUploadTitle: 'Add files',
    fileUploadHint: 'Drop them here or pick them from your device',
    fileUploadDrop: 'Drop to upload',
    fileUploadDropAdd: 'Drop to add',
    fileUploadList: 'Files',
    fileUploading: 'Uploading',
    fileUploaded: 'Uploaded',
    fileFailed: 'Upload failed',
    fileTooLarge: (max) => `Larger than ${max}`,
    fileTypeRefused: (name) => `${name} is not an accepted type.`,
    fileTypesRefused: 'Some files were not added: their type is not accepted.',
    fileTooMany: (max) => `${max} file${max > 1 ? 's' : ''} at most.`,
    fileRetry: 'Retry',
    retryFile: (name) => `Retry ${name}`,
    removeFile: (name) => `Remove ${name}`,
    uploadingFile: (name) => `Uploading ${name}`,
    filesAdded: (count) => `${count} file${count > 1 ? 's' : ''} added.`,
    fileUploadedNamed: (name) => `${name} uploaded.`,
    fileFailedNamed: (name, reason) => `${name}: ${reason}.`,
    fileRemoved: (name) => `${name} removed.`,
    fileRetrying: (name) => `Retrying ${name}.`,
    // Calendar, DateRangePicker, ColorPicker (after Arc UI).
    today: 'Today',
    todayLabel: (day) => `Today, ${day}`,
    dayCount: (count) => (count > 1 ? `${count} days` : '1 day'),
    pickEndDate: 'Pick an end date',
    colorPickerLabel: 'Colour',
    colorPanel: (label) => `Colour “${label}”`,
    colorArea: 'Saturation and brightness',
    colorAreaRole: '2D slider',
    colorAreaValue: (saturation, brightness) =>
      `Saturation ${saturation}%, brightness ${brightness}%`,
    colorHue: 'Hue',
    colorHueValue: (degrees) => `${degrees} degrees`,
    colorOpacity: 'Opacity',
    colorFormat: (format) => `Format ${format}, switch format`,
    colorIn: (label, format) => `${label} in ${format}`,
    colorInvalid: 'Enter a HEX, RGB, HSL or OKLCH colour.',
    colorEyedropper: 'Pick a colour from the screen',
    colorContrastWith: 'against the background',
    contrastGrade: (grade) => (grade === 'fail' ? 'Fails' : grade),
    contrastRead: (ratio, grade, passes) =>
      `Contrast ${ratio} to 1 against the background: ${passes ? `passes ${grade}` : 'fails'}.`,
    colorSave: (hex) => `Save ${hex}`,
    colorSaved: 'Saved colours',
    colorSwatch: (color) =>
      `${color}. Alt and arrow keys to move, Delete to remove.`,
    // NumberField, MoneyField, PhoneField (lot 3).
    numberMin: (limit) => `Min ${limit}`,
    numberMax: (limit) => `Max ${limit}`,
    numberAtMin: (value) => `${value}, minimum`,
    numberAtMax: (value) => `${value}, maximum`,
    moneyUpTo: (amount) => `Up to ${amount}`,
    moneyAtLeast: (amount) => `At least ${amount}`,
    moneyBetween: (min, max) => `${min} to ${max}`,
    moneyAdd: (amount) => `Add ${amount}`,
    moneyQuickAdd: 'Quick add',
    phoneCountry: (country, dial) => `Country: ${country} +${dial}`,
    phoneSearch: 'Search a country or a calling code',
    phoneSearchPlaceholder: 'Country or code',
    phoneSuggested: 'Suggested',
    phoneAllCountries: 'All countries',
    phoneCountries: 'Countries',
    phoneCloseList: 'Close the country list',
    phoneNoCountry: (query) => `No country for “${query}”`,
    phoneCountryCount: (count) =>
      `${count} ${count === 1 ? 'country' : 'countries'}`,
    phoneCountrySet: (country) => `Country: ${country}`,
    phoneDigits: (country, lengths) =>
      `${country}: ${
        lengths.length > 1
          ? `${lengths.slice(0, -1).join(', ')} or ${lengths[lengths.length - 1]}`
          : lengths[0]
      } digits expected`,
    phoneValid: (country) => `Valid number (${country})`,
    // Sparkline, Gauge, BarChart, LineChart, DonutChart, ActivityHeatmap (after Arc UI).
    chartExplore: (label) => `${label}: explore the values`,
    chartReading: (label, value) => `${label}: ${value}`,
    chartPointOf: (index, total) => `Point ${index} of ${total}`,
    chartLatest: 'Latest value',
    chartOutOf: (value, max) => `${value} of ${max}`,
    chartAverage: 'Average',
    chartAverageShort: 'Avg',
    chartValue: 'Value',
    chartPeriod: 'Period',
    chartHighest: (label, value) => `Highest: ${label}, ${value}.`,
    chartLowest: (label, value) => `Lowest: ${label}, ${value}.`,
    chartNoData: 'No data for this period',
    chartSeriesGroup: (label) => `${label} series`,
    chartSeriesShown: (shown, total) => `${shown} of ${total} series shown`,
    chartChooseSeries: 'Choose a series to show',
    chartSpan: (label, from, to) => `${label}, ${from} to ${to}.`,
    chartLatestOf: (series, value) => `${series}, latest ${value}`,
    chartTotal: 'Total',
    chartOther: 'Other',
    chartShareOfTotal: (share) => `${share} of total`,
    chartIncludes: (names) => `Includes ${names}`,
    chartAndMore: (names, count) => `${names} and ${count} more`,
    chartToggled: (label, shown, total) =>
      `${label} ${shown ? 'shown' : 'hidden'}. Total: ${total}.`,
    chartHiddenItem: (label) => `${label}, hidden`,
    chartSegments: (label, toggles) =>
      `${label}, segments${toggles ? '. Press a segment to show or hide it' : ''}`,
    chartRingHint: (label) =>
      `${label}. Use the arrow keys to read each segment.`,
    chartSegment: 'Segment',
    chartShare: 'Share',
    chartRange: (from, to) => `${from} to ${to}`,
    chartOrMore: (value) => `${value} or more`,
    heatmapUnit: { one: 'activity', other: 'activities' },
    heatmapLess: 'Less',
    heatmapMore: 'More',
    heatmapHighlight: (range) => `Highlight days with ${range}`,
    heatmapLevels: 'Highlight days by level',
    heatmapDays: (count, formatted) =>
      `${formatted} ${count === 1 ? 'day' : 'days'}`,
    heatmapDaysWith: (days, range) => `${days} with ${range}`,
    heatmapLegend: (levels) => `Darker squares mean more. Levels: ${levels}.`,
    // Streamgraph, BrushChart, Ridgeline, Treemap, WaffleChart, SlopeChart (after Arc UI).
    streamgraphRole: 'stream graph',
    brushRole: 'time series chart',
    ridgelineRole: 'ridgeline chart',
    treemapRole: 'treemap',
    waffleRole: 'waffle chart',
    slopeRole: 'slope chart',
    streamgraphKeys:
      'Left and right arrows move through time, up and down change the series.',
    brushKeys: 'Left and right arrows read each day. Double click shows all.',
    ridgelineKeys:
      'Up and down arrows choose a ridge, left and right move along the values.',
    treemapKeys:
      'Arrow keys move between tiles, Enter zooms in, Escape zooms out.',
    waffleKeys: (cells) =>
      `${cells} cells. Arrow keys move between cells, Page Up and Page Down between categories.`,
    slopeKeys: (order) =>
      `Up and down arrows move between items in ${order} order.`,
    chartCategories: (label) => `${label} categories`,
    chartCategory: 'Category',
    waffleCells: 'Cells',
    brushWindow: (label) => `${label} window`,
    brushWindowRole: 'date window',
    brushWindowStart: 'Window start',
    brushWindowEnd: 'Window end',
    brushShowing: (range) => `Showing ${range}`,
    brushAverage: (value) => `${value} seven-day average`,
    brushVsWeek: (change) => `${change} vs a week earlier`,
    brushDate: 'Date',
    brushEvent: 'Event',
    ridgelineMedian: 'Median',
    ridgelineMiddle: 'Middle half',
    ridgelineSpread: 'Range',
    ridgelineAtOrBelow: (share, value) => `${share} at or below ${value}`,
    ridgelineDescribe: (label, median, middle, spread, count) =>
      `${label}: median ${median}, middle half ${middle}, range ${spread}, ${count} ${count === 1 ? 'value' : 'values'}`,
    ridgelineSeries: 'Series',
    ridgelineFirstQuartile: 'First quartile',
    ridgelineThirdQuartile: 'Third quartile',
    ridgelineLowest: 'Lowest',
    ridgelineHighest: 'Highest',
    ridgelineCount: 'Count',
    treemapPath: (label) => `${label} path`,
    treemapShareOf: (share, parent) => `${share} of ${parent}`,
    treemapPathColumn: 'Path',
    treemapShareColumn: 'Share of parent',
    slopeRankSame: 'same rank',
    slopeRankUp: (places, rank) => `up ${places} to rank ${rank}`,
    slopeRankDown: (places, rank) => `down ${places} to rank ${rank}`,
    slopeRankMove: (from, to) => `${from} to ${to}`,
    slopeItem: 'Item',
    slopeChange: 'Change',
    slopeRank: 'Rank',
  },
}
