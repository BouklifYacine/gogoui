import ambre from '../themes/ambre.css?inline'
import ardoise from '../themes/ardoise.css?inline'
import bleu from '../themes/bleu.css?inline'
import rose from '../themes/rose.css?inline'
import vert from '../themes/vert.css?inline'
import violet from '../themes/violet.css?inline'

/*
 * The « Palette » toolbar: the published palettes (themes/*.css) read as
 * text, so the preview draws a story with the very file a project imports.
 * « Neutre » adds nothing: GoGoUI's own look.
 */
export const paletteCss: Record<string, string> = {
  bleu,
  vert,
  violet,
  ambre,
  rose,
  ardoise,
}

export const paletteToolbar = {
  description: 'Palette de marque (themes/*.css)',
  toolbar: {
    title: 'Palette',
    icon: 'paintbrush' as const,
    items: [
      { value: 'neutre', title: 'Neutre' },
      { value: 'bleu', title: 'Bleu' },
      { value: 'vert', title: 'Vert' },
      { value: 'violet', title: 'Violet' },
      { value: 'ambre', title: 'Ambre' },
      { value: 'rose', title: 'Rose' },
      { value: 'ardoise', title: 'Ardoise' },
    ],
    dynamicTitle: true,
  },
}
