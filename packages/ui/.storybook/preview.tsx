import '@fontsource-variable/inter/opsz.css'
import './preview.css'

import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import addonThemes, { withThemeByClassName } from '@storybook/addon-themes'
import { definePreview } from '@storybook/react-vite'

import { GoGoUIProvider } from '../src/i18n/gogoui-provider.tsx'
import type { GoGoUILocale } from '../src/i18n/messages.ts'

export default definePreview({
  addons: [addonDocs(), addonA11y(), addonThemes()],
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // Fail the a11y check of a story on any violation (WCAG AA).
    a11y: { test: 'error' },
    backgrounds: { disable: true },
    viewport: {
      options: {
        phone: {
          name: 'Téléphone (375)',
          styles: { width: '375px', height: '812px' },
        },
        tablet: {
          name: 'Tablette (768)',
          styles: { width: '768px', height: '1024px' },
        },
      },
    },
  },
  globalTypes: {
    locale: {
      description: 'Langue des mots écrits par GoGoUI',
      toolbar: {
        title: 'Langue',
        icon: 'globe',
        items: [
          { value: 'fr', title: 'Français' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'fr' },
  decorators: [
    withThemeByClassName({
      themes: { clair: '', sombre: 'dark' },
      defaultTheme: 'clair',
      parentSelector: 'html',
    }),
    (Story, context) => (
      <GoGoUIProvider locale={context.globals.locale as GoGoUILocale}>
        <div className="p-6 text-fg">
          <Story />
        </div>
      </GoGoUIProvider>
    ),
  ],
})
