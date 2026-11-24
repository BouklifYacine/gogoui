---
'@gogoui/ui': minor
---

Every story is now a test: it must render and pass axe (WCAG 2.2 AA) in light and dark, and CI blocks on any violation. What the first run found is fixed: the Combobox chip's × has a name (`removeLabel`), a slider inside `FieldShell` is named by its label, `FileDrop` holds no control inside its button, `MentionInput` drops a role a textarea cannot take, `RichTextEditor` takes `aria-labelledby`, skeletons are hidden from screen readers with one « Chargement » instead, chart texts reach 4.5:1, Calendar days and other buttons say what they show, and the Calendar no longer adds an unnamed navigation landmark.

Every field works controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`); `FileUpload` takes `items` / `defaultItems`.

A brand colour in one variable: set `--brand` and the primary, its hover, pressed, tints and focus follow, in light and dark, with a `--brand-50…950` scale. Or import a ready palette (`@gogoui/ui/themes/bleu.css`, `vert`, `violet`, `ambre`, `rose`, `ardoise`), or generate one with `createTheme('#1a66fe')` from `@gogoui/ui/theme`.

Every component that writes words takes a `labels` prop for its own words. `GoGoUIProvider` takes a whole language in `messages`, and the languages are published apart (`@gogoui/ui/locales/fr`, `@gogoui/ui/locales/en`): an app in French never loads English.

Lighter: motion's features load once, after the page, so each component costs 15 to 27 kB less up front (Button 67 → 40 kB).

`ExpandableText` takes `open`, `defaultOpen` and `onOpenChange`. Deprecated, removed in 0.4.0: `InputWithIcon`, `TextMorph`, `ShortcutRecorder`, `ShortcutField`, `MentionInput`, `MentionField`, `ExpandingButtonGroup`, `Menubar`, `Resizable`, `ColorPicker`, `ColorPickerField`, `GuideOffer`, and ExpandableText's `expanded`, `defaultExpanded`, `onExpandedChange`.

Fixed: the Sidebar skeleton and the Calendar's « Aujourd'hui » no longer differ between server and browser; `Heading` takes its parent's colour, so it reads on a dark band.
