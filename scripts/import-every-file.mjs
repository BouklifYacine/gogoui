/*
 * Imports every built file of @gogoui/ui in Node, the way an app's
 * server render or a Node test runner loads it. Node's ESM is strict: an
 * import naming an export the module does not have fails here, where
 * Vite's pre-bundling in the story tests lets it through (0.3.0 shipped
 * ColorPicker importing `Reorder` from motion/react-m, which broke every
 * form loading the bound fields).
 *
 * Run with Node, not Bun: `node scripts/import-every-file.mjs`.
 */
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const dist = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'packages',
  'ui',
  'dist',
)

function builtFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return builtFiles(file)
    }
    return file.endsWith('.js') ? [file] : []
  })
}

const files = builtFiles(dist)
const failures = []
for (const file of files) {
  try {
    await import(pathToFileURL(file).href)
  } catch (error) {
    failures.push(`${path.relative(dist, file)}: ${error.message}`)
  }
}

if (failures.length > 0) {
  console.error(`${failures.length} of ${files.length} files fail to import:`)
  for (const failure of failures) {
    console.error(`  ${failure}`)
  }
  process.exit(1)
}
console.log(`All ${files.length} built files import in Node.`)
