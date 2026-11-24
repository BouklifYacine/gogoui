# Changing GoGoUI itself

For work inside the GoGoUI repository: a component, a token, the build, a version. Each rule below cost a broken release or a day once.

## No breaking change for the projects

- Before changing a component, grep the projects that use it (Talyra: `Documents/Talyra/front-end/src`) and check each use still works.
- Exports, props and their meaning, `data-slot`, roles and accessible names stay. A prop that becomes useless stays accepted, marked `@deprecated`. A component that goes away first becomes a `@deprecated` alias of its replacement; the owner removes deprecations one by one, never a batch.
- A change that alters what a project shows (on desktop or phone) is the owner's call: list it before doing it.

## Phone = responsive CSS

- GoGoUI is for the web. No phone-only component, no prop to opt into a phone layout.
- The one threshold is `md` (48rem): `max-md:` / `md:` in classes, `@media (width < 48rem)` in CSS, `PHONE_QUERY` from `src/internal/breakpoint.ts` in JavaScript.
- A component's first paint follows the screen in CSS. `useIsMobile` (false on the server) only decides what a popup does once the user has opened it.
- What may differ on a phone is behaviour, inside the same component: a popup becomes a bottom sheet (`phoneSheet`, on by default), a sidebar a modal sheet. Not a popup whose trigger is a text input (Combobox): the keyboard covers a sheet.

## Animations are the red line

- Never replace a motion animation by CSS, change a duration or a curve, unless the result is the same pixel for pixel, shown side by side.
- Components use `m` (LazyMotion), never `motion.*`. `motion/react-m` exports only the `m` elements: `AnimatePresence`, `Reorder`, `animate`, `MotionConfig`… come from `motion/react`. Node refuses a named import a module lacks, Vite's dev server does not: `bun run check:package` imports every built file in Node to catch it.

## Weight: measure, then claim

- Before announcing a gain, measure before and after on the real consumer: a production build of the project, the JS each page loads and the main stylesheet (raw, gzip, brotli), and a Chrome trace on a throttled phone. size-limit alone does not say what a page pays.
- An audit's diagnosis is a hypothesis: confirm it by measuring. (Removing `@source './dist'` gained nothing in Talyra: the CSS held the classes of the components it uses.)
- The provider imports nothing optional: no second language, nothing only some apps need.

## Release

1. A changeset for every change in `packages/ui` (`bun run changeset`); an empty one for a change that ships nothing.
2. `bun run version-packages` on `main` itself (a version PR fails the changeset check). Rewrite the new CHANGELOG section into headed groups when it is long.
3. Signed commits; push; wait for CI green on `main` (lint, types, knip, every story with axe in light and dark, build, `check:package`, size). A failure in a single dark-mode contrast story that passes on re-run is a flaky test: re-run, then fix it apart.
4. Publish (`bun run release`). npm prints an « Authenticate your account at » link: open it at once in the browser signed in to npm; a late validation ends in a 404 and a new link. Then `npm view @gogoui/ui dist-tags` (a new version can take a minute to show).
5. A signed tag `vX.Y.Z` on the version commit, pushed, and a GitHub release whose notes are the CHANGELOG section.
6. Install the new version in the projects and run their checks before saying it is done.

## Files

- Write source files with an editor tool or with UTF-8 explicitly. PowerShell's `Set-Content` / `Get-Content -Raw` re-encode them and mangle accents (« problÃ¨me »).
