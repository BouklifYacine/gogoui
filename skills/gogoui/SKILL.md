---
name: gogoui
description: Build React screens with GoGoUI (@gogoui/ui), the design system on Base UI and Tailwind CSS 4. Use when a project imports @gogoui/ui, when installing or theming GoGoUI (brand colour, dark mode, language, icons, motion), when choosing which GoGoUI component fits a need, or when changing GoGoUI itself (a component, its build, a release).
---

# GoGoUI

GoGoUI is a React 19 design system for the web: shadcn/ui conventions on Base UI, styled with Tailwind CSS 4 through its tokens, light and dark, WCAG AA, French by default.

**Changing GoGoUI itself** (a component, a token, the build, a version): read [MAINTAIN.md](MAINTAIN.md) first.

## Set up

1. Install: `bun add @gogoui/ui @phosphor-icons/react` (or npm/pnpm). A few components need a peer of their own, installed only when used: `react-day-picker` (Calendar, DateField, DateRangePicker), `sonner` (Toaster), `@tanstack/react-table` (`@gogoui/ui/data-table`), `@tanstack/react-form` (`@gogoui/ui/tanstack-form`), `react-dropzone` (FileDrop), `react-resizable-panels` (Resizable), `embla-carousel-react` (Carousel), `recharts` (Chart), `cmdk` (Command), `@tiptap/*` (RichTextEditor), `react-joyride` (GuidedTour).
2. In the main CSS, after Tailwind: `@import 'tailwindcss'; @import '@gogoui/ui/styles.css';`. It brings the tokens, their Tailwind theme and the base styles, and tells Tailwind to read GoGoUI's classes.
3. Wrap the app once in `GoGoUIProvider` from `@gogoui/ui/provider` when it needs another language, its own `messages`, its own `icons` (any library), an `iconWeight`, or `motion="off"`. Without it: French, Phosphor icons, animations on. Only French is built in: another language comes in whole, `messages={en}` with `import { en } from '@gogoui/ui/locales/en'` (`locale="en"` falls back to French).

Done when a `<Button>` from `@gogoui/ui/button` renders with its shadow and the page background is the light grey canvas.

## Theme

- **Brand**: the primary is neutral. Set `--brand: #1a66fe` and the primary, its hover, pressed, tints and focus follow in light and dark; or import a palette (`@gogoui/ui/themes/bleu.css`…), or `createTheme()` from `@gogoui/ui/theme`. A project that already sets `--primary`, `--primary-hover`… itself keeps them (the focus outline then stays neutral).
- **Dark mode**: the `dark` class on `<html>`; a region that must stay light takes `light`.
- **Other tokens** (`--focus-outline`, `--menu-highlight`, `--radius`, the `--motion-*` durations and curves) are CSS variables a project overrides the same way. Read them in `@gogoui/ui/tokens.css`.

## Write with GoGoUI

- **One import per component**: `import { Select, SelectTrigger } from '@gogoui/ui/select'`. The path is the component's file name in kebab-case.
- **Before using a component, read its usage guide**: the JSDoc above its main export in `node_modules/@gogoui/ui/dist/components/<name>.d.ts` says what it is for, what to use instead, where it goes, its states, its key props and its accessibility. Pick the component the guide names for the need.
- **Shape and colour are two props**: `variant` is the shape (`default`, `outline`, `ghost`, `subtle`…), `color` the meaning (`neutral`, `primary`, `info`, `success`, `warning`, `danger`). One filled `default` button per view.
- **Sizes** are `sm`, `default`, `lg`. Every control reaches 44px under a thumb on its own.
- **Compound parts** for primitives (`Dialog` > `DialogTrigger` + `DialogContent`…), like shadcn/ui. The `…Field` components (`TextField`, `SelectField`, `DateField`…) wrap a control with its label, hint and error.
- **Fields work controlled** (`value` + `onValueChange`) **or free** (`defaultValue`), with `error`. With TanStack Form, `useAppForm` from `@gogoui/ui/tanstack-form` binds all 22 fields; to load only yours, `bindField` and `formComponents` from `@gogoui/ui/tanstack-form/core`.
- **Icons** go in as elements: `iconStart={<PlusIcon />}`, or as children of a menu item. GoGoUI's own icons follow the provider's `icons`.
- **Colours come from tokens** (`bg-surface`, `text-fg-muted`, `border-line`, `bg-primary`…), so dark mode follows. A raw hex in a class is a colour dark mode cannot change.

## Phone

GoGoUI is for the web: a phone is a narrow screen, handled by responsive CSS, never by a separate component.

- One threshold, Tailwind's `md` (48rem, 768px): `max-md:` is a phone. A project uses the same, never a second one.
- A screen's layout on a phone is CSS (`max-md:`, `md:`, container queries). A `useIsMobile` deciding what renders shows the desktop version first, then jumps: keep JavaScript for what happens after a tap.
- Menus, Select and Popover rise from the bottom edge as a sheet on a phone by themselves (`phoneSheet={false}` keeps one floating). Combobox stays anchored: the keyboard would cover a sheet.
- Every control reaches 44px on a phone on its own (`max-md:h-11`).

## Motion and focus

- Components animate by default, with no prop to turn on: menus grow from their trigger, highlights glide, labels crossfade. Springs never overshoot. A visitor whose system asks for less motion gets still components; `GoGoUIProvider motion="off"` stills them for everyone.
- New animation in a project reuses the tokens: CSS `ease-enter`, `ease-standard`, `ease-spring` with `--motion-fast` (150ms), `--motion-standard` (200ms), `--motion-spring` (440ms); exits quicker than entries.
- Keyboard focus is GoGoUI's: a softened 2px outline at 2px on controls, a darker edge on fields. A custom focusable element takes `focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus`.

## Browse

The Storybook (https://bouklifyacine.github.io/gogoui/) shows every component, its states, and a story « Animations » for those that move (tag `animated`).
