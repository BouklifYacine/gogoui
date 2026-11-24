/*
 * Checks @gogoui/ui exactly as npm will receive it. Run `bun run build`
 * first: the script packs packages/ui into a tarball, then
 *
 * - publint reads the tarball for package.json mistakes (an export
 *   pointing to a missing file, a wrong condition order…);
 * - Are The Types Wrong resolves every entry point the way TypeScript
 *   does in a project, and fails when one has no types or the wrong ones.
 *
 * - Node imports every built file (scripts/import-every-file.mjs): its
 *   strict ESM catches an import of an export a module lacks.
 *
 * attw does not expand the "./*" export, so the script lists the
 * components itself: one entry point per file in dist/components.
 */
import { readdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { $ } from 'bun'

import packageJson from '../packages/ui/package.json'

const rootDir = path.join(import.meta.dirname, '..')
const packageDir = path.join(rootDir, 'packages', 'ui')
const tarball = path.join(packageDir, 'package.tgz')

/** The exports written by hand: "./provider", "./cn"… The CSS files have no types to check. */
function namedEntryPoints(): string[] {
  return Object.keys(packageJson.exports).filter(
    (entry) => !entry.includes('*') && !entry.endsWith('.css'),
  )
}

/** "./button", "./dialog"…: what "./*" gives, one per built component. */
function componentEntryPoints(): string[] {
  const componentsDir = path.join(packageDir, 'dist', 'components')
  return readdirSync(componentsDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => `./${file.replace(/\.js$/, '')}`)
}

// The running Bun itself, not a `bun` shim from PATH (Windows runs those
// through cmd.exe, which breaks on a folder name with a space).
const bun = process.execPath

// publint and attw are the root's devDependencies: `bun run check:package`
// puts them on the PATH.
$.cwd(rootDir)

try {
  await $`${bun} pm pack --filename ${tarball} --quiet`.cwd(packageDir)

  await $`publint run ${tarball}`

  // esm-only: GoGoUI ships ESM alone ("type": "module", no "require"
  // condition), so the old node10 resolution and require() from CommonJS
  // are not supported on purpose. Every other mode must resolve to types.
  const entryPoints = [...namedEntryPoints(), ...componentEntryPoints()]
  await $`attw ${tarball} --profile esm-only --format table-flipped --entrypoints ${entryPoints}`

  await $`node scripts/import-every-file.mjs`
} finally {
  rmSync(tarball, { force: true })
}
