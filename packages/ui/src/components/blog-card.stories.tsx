import preview from '#.storybook/preview'

import { demoImage } from '../blocks/demo-images.ts'
import { BlogCard } from './blog-card.tsx'

const meta = preview.meta({
  title: 'Blocs marketing/BlogCard',
  tags: ['beta'],
  component: BlogCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'Acompte, solde, caution : trois paiements à ne pas confondre',
    href: '#acompte-solde-caution',
    date: '2026-11-08',
    category: 'Facturation',
    excerpt:
      'Ce que chacun couvre, quand le demander et comment l’écrire dans le contrat pour éviter les litiges.',
    readingTime: 6,
    author: 'L’équipe Talyra',
    image: {
      src: demoImage('vineyard'),
      alt: 'Illustration : vignes dorées en fin d’été',
    },
    variant: 'default',
  },
  render: (args) => (
    <div className="mx-auto w-full max-w-90">
      <BlogCard {...args} />
    </div>
  ),
})

/**
 * A post in a grid: point at it, its image zooms a little; the whole card
 * is the link.
 */
export const Basic = meta.story({})

/**
 * The large card at the top of an index: image beside the words, image
 * above under 680 px of width.
 */
export const Featured = meta.story({
  args: {
    variant: 'featured',
    title: 'Facture électronique : ce qui change pour les lieux de réception',
    image: {
      src: demoImage('dusk'),
      alt: 'Illustration : collines au crépuscule',
    },
  },
  render: (args) => (
    <div className="mx-auto w-full max-w-295">
      <BlogCard {...args} />
    </div>
  ),
})

/**
 * Without image, author or reading time: the words alone.
 */
export const WordsOnly = meta.story({
  args: { image: undefined, author: undefined, readingTime: undefined },
})

/**
 * Point at it: the image zooms to 1.03 in 360 ms; press it: it shrinks to
 * .99.
 */
export const Animations = meta.story({
  tags: ['animated'],
})
