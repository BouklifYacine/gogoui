import path from 'node:path'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import type { TestProjectInlineConfiguration } from 'vitest/config'

const configDir = path.join(import.meta.dirname, '.storybook')

/*
 * Every story is a test, once per theme: it must render without an error
 * and pass axe (WCAG 2.2 AA, `a11y: { test: 'error' }` in the preview).
 * The theme reaches the preview through VITE_GOGOUI_THEME; motion is off
 * there, so axe reads every story at rest, never in the middle of a fade.
 */
function storiesIn(theme: 'light' | 'dark'): TestProjectInlineConfiguration {
  return {
    extends: true,
    plugins: [storybookTest({ configDir })],
    define: {
      'import.meta.env.VITE_GOGOUI_THEME': JSON.stringify(theme),
    },
    // Prepared up front, so a cold run does not re-optimise mid-way and
    // reload the page under the tests.
    optimizeDeps: { include: ['motion/react-m'] },
    test: {
      name: `stories-${theme}`,
      // A few stories take long on a busy runner.
      testTimeout: 60_000,
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({}),
        // The first run prepares every dependency before the page answers.
        connectTimeout: 180_000,
        instances: [{ browser: 'chromium' }],
      },
    },
  }
}

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['*.test.ts', 'src/**/*.test.ts'],
          environment: 'node',
        },
      },
      storiesIn('light'),
      storiesIn('dark'),
    ],
  },
})
