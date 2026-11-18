import tailwindcss from '@tailwindcss/vite'
import { defineMain } from '@storybook/react-vite/node'

export default defineMain({
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  features: {
    // The JSON that tells an agent which components exist, their props and
    // examples (skills, MCP, `storybook tools docs`).
    componentsManifest: true,
  },
  viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    return config
  },
})
