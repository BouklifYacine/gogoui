# GoGoUI

A React design system: shadcn/ui conventions on [Base UI](https://base-ui.com),
styled with Tailwind CSS 4, light and dark, built for WCAG AA. French by
default, English included.

| Package                             | What it holds                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| [`@gogoui/tokens`](packages/tokens) | The design tokens as CSS variables (light and dark) and their Tailwind CSS 4 theme |
| [`@gogoui/ui`](packages/ui)         | 38 React components, one import each                                               |

## Requirements

React 19 and Tailwind CSS 4.

## Install

```bash
bun add @gogoui/ui @phosphor-icons/react
```

Charts, the command palette and the calendar need their library, only if
you use them: `recharts`, `cmdk`, `react-day-picker`.

## Use

In your main CSS file:

```css
@import 'tailwindcss';
@import '@gogoui/ui/styles.css';
```

Then import each component from its own path:

```tsx
import { Button } from '@gogoui/ui/button'

export function Save() {
  return <Button>Enregistrer</Button>
}
```

### Your brand

GoGoUI's primary is neutral. Give it your colour in both themes, after the
import:

```css
:root,
:where(.light) {
  --primary: #1a66fe;
  --primary-hover: #1557db;
  --primary-active: #1249b8;
  --primary-foreground: #ffffff;
}
.dark {
  --primary: #1a66fe;
  --primary-hover: #3b7cff;
  --primary-active: #1557db;
  --primary-foreground: #ffffff;
}
```

### Dark mode

Put the `dark` class on `<html>`. A part of the page that must stay light
takes the `light` class.

### Language

GoGoUI writes a few words itself (« Fermer », « Chargement »…). They are in
French until you say otherwise:

```tsx
import { GoGoUIProvider } from '@gogoui/ui/provider'

export function App({ children }: { children: React.ReactNode }) {
  return <GoGoUIProvider locale="en">{children}</GoGoUIProvider>
}
```

`messages={{ close: 'Retour' }}` overrides a single word.

## For AI agents

The Storybook publishes a components manifest (names, props, usage
examples, when to use each component), read by Storybook's agent skills
and MCP server.

## Develop

```bash
bun install
bun run storybook       # http://localhost:6006
bun run test            # token contrast checks
bun run build           # packages/ui/dist
```

Each user-visible change gets a changeset: `bun run changeset`.

## License

MIT. GoGoUI adapts code from shadcn/ui and Bklit UI, see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
