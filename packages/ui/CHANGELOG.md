# @gogoui/ui

## 0.4.0

### Minor Changes

#### The phone is responsive CSS

One threshold for the whole system: `md` (48rem, 768px). Nothing changes at 768px and wider.

- **Menus, Select and Popover rise from the bottom edge as a sheet on a phone**, by default; `phoneSheet={false}` keeps one floating. The menus' sheet now starts under 768px instead of 640px. Combobox stays anchored, so the phone's keyboard cannot cover it.
- **FilterMenu** is one popover, a sheet on a phone, instead of a Drawer chosen in JavaScript.
- **DataTable** draws its phone cards and its table from the same rows, each shown by CSS: a phone gets its cards from the first paint, without the table first and a jump.
- **New `SettingsSection`**: folds on a phone and stays open from 768px, in CSS. `MobileSettingsSection` becomes its deprecated alias.
- **ExpandingButtonGroup** takes its 44px phone height from CSS, with the same animation.
- **GuidedTour** reads the phone threshold safely on the server.

#### Lighter

- Only French is built into `GoGoUIProvider`: English comes in with `messages={en}` from `@gogoui/ui/locales/en`, so a French app never downloads it. `locale="en"` now falls back to French.
- New entry `@gogoui/ui/tanstack-form/core`: `bindField`, the contexts and `formComponents` without the 22 fields, for an app that binds only its own. `@gogoui/ui/tanstack-form` is unchanged.

### Patch Changes

- A bound `Form` focuses its own error summary, so two forms on a page no longer share one.

## 0.3.1

### Patch Changes

- 303b776: Fixed: 0.3.0 broke any app importing the bound fields (`@gogoui/ui/tanstack-form`) or ColorPicker, with « motion/react-m does not provide an export named Reorder ». ColorPicker takes `Reorder` from motion/react again, and the package check now imports every built file in Node, so such an import cannot ship again.

## 0.3.0

### Minor Changes

#### Accessibility, tested on every story

- Every story is now a test: it must render and pass axe (WCAG 2.2 AA) in light and dark, and CI blocks on any violation.
- What the first run found is fixed: the Combobox chip's × has a name (`removeLabel`); a slider inside `FieldShell` is named by its label; `FileDrop` holds no control inside its button; `MentionInput` drops a role a textarea cannot take; `RichTextEditor` takes `aria-labelledby`; skeletons are hidden from screen readers, with one « Chargement » instead; chart texts reach 4.5:1; Calendar days and other buttons say what they show; the Calendar no longer adds an unnamed navigation landmark.

#### Fields, controlled or not

- Every field works controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
- `FileUpload` takes `items` / `defaultItems`.

#### A brand colour in one variable

- Set `--brand` and the primary, its hover, pressed, tints and focus follow, in light and dark, with a `--brand-50…950` scale.
- Or import a ready palette: `@gogoui/ui/themes/bleu.css`, `vert`, `violet`, `ambre`, `rose`, `ardoise`.
- Or generate one with `createTheme('#1a66fe')` from `@gogoui/ui/theme`.

#### Words and languages

- Every component that writes words takes a `labels` prop for its own words.
- `GoGoUIProvider` takes a whole language in `messages`, and the languages are published apart (`@gogoui/ui/locales/fr`, `@gogoui/ui/locales/en`): an app in French never loads English.

#### Lighter

- Motion's features load once, after the page, so each component costs 15 to 27 kB less up front (Button 67 → 40 kB).

#### API

- `ExpandableText` takes `open`, `defaultOpen` and `onOpenChange`.
- Deprecated, removed in 0.4.0: `InputWithIcon`, `TextMorph`, `ShortcutRecorder`, `ShortcutField`, `MentionInput`, `MentionField`, `ExpandingButtonGroup`, `Menubar`, `Resizable`, `ColorPicker`, `ColorPickerField`, `GuideOffer`, and ExpandableText's `expanded`, `defaultExpanded`, `onExpandedChange`.

### Patch Changes

- The Sidebar skeleton and the Calendar's « Aujourd'hui » no longer differ between server and browser.
- `Heading` takes its parent's colour, so it reads on a dark band.
- PhoneField shows each country's flag as a small picture (country-flag-icons, MIT) instead of an emoji: Windows has no flag emoji and drew two letters (« FR ») off the line of the dialling code.

## 0.2.4

### Patch Changes

- fe11861: PillTabsList's tray keeps a hairline edge in dark mode.

## 0.2.3

### Patch Changes

- PillTabsList tabs take a `note` (« 1 en retard », « À signer »). PageHeader takes a `guide` target and `descriptionOnPhone`, and keeps its buttons beside the title on a phone when they fit.

## 0.2.2

Not published on npm: it shipped inside 0.2.3.

### Patch Changes

- UserMenu rises from the bottom edge as a sheet on a phone (`phoneSheet`, also on `DropdownMenuContent`), takes a router link on its rows (`render`), and its chevron sits at the far end of a wide trigger. ActionSwap states take an `srLabel` for screen readers, and SplitButton an `id` on its main action.

## 0.2.1

### Patch Changes

- 72c1f6d: Fixed: an AlertDialog opened over a sheet or another dialog draws its veil again, so the panel under it no longer answers a tap. A TitledSection's aside goes under its title on a phone instead of squeezing it. PageHeading takes its parent's colour, so a title on a dark header stays legible. FixedActionBar no longer adds the home indicator's space twice when the project's offset already counts it (`--fixed-bar-safe-area: 0px`). New: `arrowClassName` on TooltipContent, and `announce={false}` on CopyButton where the page already says the result.

## 0.2.0

### Minor Changes

- 4a3ed50: One package: the design tokens now ship inside `@gogoui/ui` (`@gogoui/ui/tokens.css`, `@gogoui/ui/theme.css`, still imported for you by `@gogoui/ui/styles.css`); `@gogoui/tokens` is no longer needed. Twelve charts drawn in SVG with motion, adapted from Arc UI: Sparkline, Gauge, BarChart, LineChart, DonutChart, ActivityHeatmap, Streamgraph, BrushChart, RidgelineChart, Treemap, WaffleChart and SlopeChart, each with a text alternative and keyboard reading. Fixed: the Calendar no longer breaks when it changes month.

## 0.1.0

### Minor Changes

- c56ca43: Arc UI's free components, in GoGoUI's API and tokens. New: SplitButton, ExpandingButtonGroup, ActionSwap, HoldToConfirm, SwipeActions, UserMenu, ShortcutRecorder and ShortcutField, TagInput and TagField, MentionInput and MentionField, ExpandableText, MultiSelectField, BillingToggle and BillingPrice, RollingNumber, Rating and RatingField, PhoneField, ColorPicker and ColorPickerField, TextMorph, SignaturePad and SignatureField, FileUpload, ChangelogFeed and ChangelogEntry, BlogGrid and BlogCard, SiteHeader. New variants: ButtonGroup `surface`, ThemeToggle `button`, Select `multiple` chips and `morph`, ToggleGroup `chips`, Slider `elastic`, RangeSlider `histogram`. Animated: Checkbox, RadioGroup, RadioCardField (with `description`, `meta`, `disabledReason`), Select, Combobox, CopyButton, Input and Textarea messages, PasswordStrength, NumberField, MoneyField, Calendar (Arc's look, 44px days, six weeks), DateField, DateRangePicker, Dialog, ScrollArea edge fades, Resizable, Kbd keycaps. The new fields are bound in `@gogoui/ui/tanstack-form`. SlideToConfirm's `destructive` becomes `color`.
- c56ca43: Keyboard focus now shows on every control: a softened 2px outline at 2px, and fields darken their edge without a halo (the outline used to stay invisible on buttons, tabs, toggles and links). Menus (DropdownMenu, its sub-menus, ContextMenu, Menubar) grow from their button, their rows following one after another; one highlight glides from row to row under the pointer; panels are rounder, rows airier, separators quieter, and the floating shadow is softer and wider. A button squeezes quickly when pressed and its words crossfade when they change. GoGoUIProvider takes `motion="off"` to still every animation for everyone. New tokens: motion durations and curves (`--motion-*`, `ease-enter`, `ease-standard`, `ease-spring`), `--focus-outline`, `--menu-highlight`, `--line-subtle` and `--radius-menu`. The focus shadows `shadow-focus`, `shadow-focus-primary` and `shadow-focus-danger` are gone.
- f33c2c9: About seventy new components: toasts, a confirmation dialog, form fields bound or not to TanStack Form, a data table with search, sort, selection and pages, list filters, page layout, settings rows, slide to confirm, file and photo drops, and a guided tour. Also Alert, Accordion, Toggle, ToggleGroup, NumberField, ScrollArea, StatCard and a ThemeToggle that keeps the theme on the device. A `color` prop (neutral, primary, info, success, warning, danger) on Button, Badge, Alert, Progress, Spinner, Switch, Checkbox, Radio, Slider, RangeSlider, Toggle, ToggleGroup, Avatar, StatCard, PillTabsList, StepBars and EmptyState; Button and Badge gain the solid and subtle shapes. New tokens give readable words on each colour's fill. Table pieces without logic (sort header, row and page boxes, toolbar, pagination, empty and loading rows), calendar colour and period shortcuts, a size prop on inputs, selects, fields, NumberField and Tabs, and icons: GoGoUIProvider takes icons (any library) and iconWeight, Button takes iconStart and iconEnd. SimpleTooltip, HoverCard, ContextMenu, NavigationMenu, Timeline and Item; Dialog and Sheet sizes; a character counter on TextareaField; a spinner on promise toasts. Heading, Text, Stack, AspectRatio, Meter, Menubar, Carousel, Resizable and a RichTextEditor.

### Patch Changes

- Updated dependencies [c56ca43]
- Updated dependencies [f33c2c9]
  - @gogoui/tokens@0.1.0
