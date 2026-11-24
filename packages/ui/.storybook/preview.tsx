import '@fontsource-variable/inter/opsz.css'
import './preview.css'

import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import addonThemes, { withThemeByClassName } from '@storybook/addon-themes'
import { definePreview } from '@storybook/react-vite'

import { GoGoUIProvider } from '../src/i18n/gogoui-provider.tsx'
import { en } from '../src/i18n/locales/en.ts'
import { paletteCss, paletteToolbar } from './palettes.ts'

// The dark test run sets `dark` on <html> before the first story renders:
// the theme decorator adds it in an effect, and axe used to read a link
// in its light colour over a dark background in that gap (a flaky
// contrast failure on ErrorSummary and Tabs).
if (import.meta.env.VITE_GOGOUI_THEME === 'dark') {
  document.documentElement.classList.add('dark')
}

export default definePreview({
  addons: [addonDocs(), addonA11y(), addonThemes()],
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // The sidebar from « where to start » to « what you build with », then
    // the bigger pieces; inside a category, alphabetical.
    options: {
      storySort: {
        order: [
          'Introduction',
          'Démarrer',
          'Fondations',
          'Actions',
          'Formulaires',
          [
            'Saisie',
            'Champs prêts',
            'Dates et heures',
            'Fichiers',
            'Structure',
          ],
          'Confirmations',
          'Fenêtres',
          'Menus',
          'Navigation',
          'Retours',
          'Affichage',
          'Listes et tableaux',
          'Filtres et recherche',
          'Mise en page',
          'Texte animé',
          'Graphiques',
          'Réglages',
          'Blocs marketing',
        ],
        method: 'alphabetical',
      },
    },
    // Only the props that change the look or the content: the HTML and
    // event props of every element would bury them.
    controls: {
      exclude:
        /^(on[A-Z].*|aria-.*|data-.*|style|className|render|ref|key|id|nativeButton|focusableWhenDisabled|tabIndex|form.*|name|type)$/,
      sort: 'requiredFirst',
    },
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
    palette: paletteToolbar,
  },
  initialGlobals: { locale: 'fr', palette: 'neutre' },
  decorators: [
    withThemeByClassName({
      themes: { clair: '', sombre: 'dark' },
      // The dark test run (vitest.config.ts) opens every story at night.
      defaultTheme:
        import.meta.env.VITE_GOGOUI_THEME === 'dark' ? 'sombre' : 'clair',
      parentSelector: 'html',
    }),
    (Story, context) => (
      <GoGoUIProvider
        // French is built in; English comes in, as an app would pass it.
        messages={context.globals.locale === 'en' ? en : undefined}
        motion={import.meta.env.VITE_GOGOUI_THEME ? 'off' : 'auto'}
      >
        <div className="p-6 text-fg">
          <Story />
        </div>
      </GoGoUIProvider>
    ),
    // The « Palette » toolbar: the chosen theme file, as a style tag.
    (Story, context) => {
      const css = paletteCss[context.globals.palette as string]
      return (
        <>
          {css ? <style>{css}</style> : null}
          <Story />
        </>
      )
    },
  ],
})
