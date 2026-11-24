import { defineConfig } from 'tsdown'

/*
 * One file per component in dist/components, so a project only bundles
 * what it imports (`@gogoui/ui/button`). Every JS file starts with
 * "use client": the components hold state and effects, and a Next.js
 * server component may import them. The theme helpers (dist/theme) are
 * plain functions a server may call, so they go without it.
 */
const needsUseClient = (fileName: string) =>
  fileName.endsWith('.js') && !fileName.startsWith('theme/')

export default defineConfig({
  entry: [
    'src/components/*.tsx',
    'src/lib/cn.ts',
    'src/i18n/index.ts',
    'src/tanstack-form/index.ts',
    'src/data-table/index.ts',
    'src/theme/create-theme.ts',
    '!src/**/*.stories.tsx',
    '!src/**/*.test.tsx',
  ],
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  unbundle: true,
  outputOptions: {
    banner: (chunk) => (needsUseClient(chunk.fileName) ? '"use client";' : ''),
  },
})
