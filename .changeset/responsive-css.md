---
'@gogoui/ui': minor
---

The phone is responsive CSS, with one threshold: `md` (48rem, 768px).

- **Menus, Select and Popover rise from the bottom edge as a sheet on a phone**, by default (`phoneSheet={false}` keeps one floating). Combobox stays anchored, so the phone's keyboard cannot cover it. The menus' sheet now starts under 768px instead of 640px.
- **FilterMenu** is one popover, a sheet on a phone, instead of a Drawer chosen in JavaScript.
- **DataTable** draws its phone cards and its table from the same rows, each shown by CSS, so a phone gets its cards from the first paint instead of the table then a jump.
- **New `SettingsSection`**: folds on a phone and stays open from 768px, in CSS. `MobileSettingsSection` is now its deprecated alias.
- **ExpandingButtonGroup** takes its 44px phone height from CSS, same animation.
- **GuidedTour** reads the phone threshold safely on the server.
- **Languages**: only French is built into `GoGoUIProvider`; English comes in with `messages={en}` from `@gogoui/ui/locales/en`, so a French app never downloads it. `locale="en"` now falls back to French.
- **`@gogoui/ui/tanstack-form/core`**: `bindField`, the contexts and `formComponents` without the 22 fields, for an app that binds only its own. `@gogoui/ui/tanstack-form` is unchanged.
- Fixed: a bound `Form` focuses its own error summary, so two forms on a page no longer share one.
