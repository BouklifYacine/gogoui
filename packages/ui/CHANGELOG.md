# @gogoui/ui

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
