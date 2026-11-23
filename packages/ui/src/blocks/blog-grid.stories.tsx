import { useState } from 'react'

import preview from '#.storybook/preview'

import { BlogGrid } from '../components/blog-grid.tsx'
import type { BlogPost } from '../components/blog-grid.tsx'
import { demoImage } from './demo-images.ts'

const author = 'L’équipe Talyra'

const posts: BlogPost[] = [
  {
    id: 'facture-electronique',
    title: 'Facture électronique : ce qui change pour les lieux de réception',
    href: '#facture-electronique',
    date: '2026-11-15',
    category: 'Facturation',
    excerpt:
      'Dates, formats, plateformes : ce qu’un domaine qui reçoit des mariages doit préparer avant l’obligation, et ce qui peut attendre.',
    readingTime: 8,
    author,
    image: {
      src: demoImage('dusk'),
      alt: 'Illustration : collines au crépuscule',
    },
    featured: true,
  },
  {
    id: 'acompte-solde-caution',
    title: 'Acompte, solde, caution : trois paiements à ne pas confondre',
    href: '#acompte-solde-caution',
    date: '2026-11-08',
    category: 'Facturation',
    excerpt:
      'Ce que chacun couvre, quand le demander et comment l’écrire dans le contrat pour éviter les litiges.',
    readingTime: 6,
    author,
    image: {
      src: demoImage('vineyard'),
      alt: 'Illustration : vignes dorées en fin d’été',
    },
  },
  {
    id: 'repondre-vite',
    title: 'Répondre à une demande de mariage en moins d’une heure',
    href: '#repondre-vite',
    date: '2026-11-02',
    category: 'Commercial',
    excerpt:
      'Les couples écrivent à plusieurs lieux le même soir. Une réponse rapide et précise fait souvent la différence.',
    readingTime: 5,
    author,
    image: {
      src: demoImage('dawn'),
      alt: 'Illustration : lever de soleil sur des collines roses',
    },
  },
  {
    id: 'tva-hebergement',
    title: 'La TVA d’une location de salle avec hébergement',
    href: '#tva-hebergement',
    date: '2026-10-26',
    category: 'Facturation',
    excerpt:
      'Salle, chambres, ménage, mobilier : chaque ligne du devis n’a pas forcément le même taux.',
    readingTime: 7,
    author,
    image: {
      src: demoImage('lake'),
      alt: 'Illustration : lac entre des collines bleutées',
    },
  },
  {
    id: 'visites-du-samedi',
    title: 'Organiser les visites du samedi sans y passer la semaine',
    href: '#visites-du-samedi',
    date: '2026-10-19',
    category: 'Gestion du lieu',
    excerpt:
      'Des créneaux fixes, un rappel la veille et une fiche prête pour chaque couple.',
    readingTime: 4,
    author,
    image: {
      src: demoImage('garden'),
      alt: 'Illustration : jardin vert pâle au printemps',
    },
  },
  {
    id: 'taxe-de-sejour',
    title:
      'Taxe de séjour : qui la collecte quand les invités dorment sur place ?',
    href: '#taxe-de-sejour',
    date: '2026-10-12',
    category: 'Facturation',
    excerpt:
      'Le lieu, le couple ou la plateforme de réservation : les cas les plus fréquents, expliqués simplement.',
    readingTime: 6,
    author,
    image: {
      src: demoImage('meadow'),
      alt: 'Illustration : prairie verte sous un ciel clair',
    },
  },
  {
    id: 'bloquer-une-date',
    title: 'Bloquer une date : option, pré-réservation ou contrat ?',
    href: '#bloquer-une-date',
    date: '2026-10-05',
    category: 'Gestion du lieu',
    excerpt:
      'Combien de temps tenir une option, et quand la libérer sans froisser personne.',
    readingTime: 5,
    author,
    image: {
      src: demoImage('dawn'),
      alt: 'Illustration : collines roses au petit matin',
    },
  },
  {
    id: 'site-du-lieu',
    title: 'Ce que les couples regardent en premier sur votre site',
    href: '#site-du-lieu',
    date: '2026-09-28',
    category: 'Commercial',
    excerpt:
      'La capacité, les photos des espaces et un prix de départ : le reste vient après.',
    readingTime: 4,
    author,
    image: {
      src: demoImage('vineyard'),
      alt: 'Illustration : coteaux de vignes au soleil',
    },
  },
  {
    id: 'saison-2027',
    title: 'Préparer la saison 2027 dès l’automne',
    href: '#saison-2027',
    date: '2026-09-20',
    category: 'Gestion du lieu',
    excerpt:
      'Tarifs, dates bloquées, prestataires : une liste à reprendre avant les salons de janvier.',
    readingTime: 6,
    author,
    image: {
      src: demoImage('dusk'),
      alt: 'Illustration : ciel du soir sur des collines sombres',
    },
  },
  {
    id: 'relancer-un-couple',
    title: 'Relancer un couple qui ne répond plus, sans insister',
    href: '#relancer-un-couple',
    date: '2026-09-12',
    category: 'Commercial',
    excerpt:
      'Deux relances, un ton léger et une date limite claire pour l’option.',
    readingTime: 3,
    author,
    image: {
      src: demoImage('lake'),
      alt: 'Illustration : lac calme au matin',
    },
  },
]

const meta = preview.meta({
  title: 'Blocs/BlogGrid',
  component: BlogGrid,
  parameters: { layout: 'padded' },
  args: {
    posts,
    title: 'Le journal des lieux de réception',
    description:
      'Facturation, organisation, relation avec les couples : des articles courts pour les gérants de domaines et de salles.',
    pageSize: 6,
    showFeatured: true,
  },
})

/**
 * A blog's home: the featured post large, then the others by six. Choose a
 * category or a page; each card links to its post.
 */
export const Basic = meta.story({})

/**
 * Category and page kept by the page (in the URL, say), here in a state.
 */
export const Controlled = meta.story({
  render: function Render(args) {
    const [category, setCategory] = useState<string | null>('Facturation')
    const [page, setPage] = useState(1)
    return (
      <BlogGrid
        {...args}
        category={category}
        onCategoryChange={setCategory}
        page={page}
        onPageChange={setPage}
      />
    )
  },
})

/**
 * On a phone: one column, the featured image above its words, the
 * categories scroll sideways.
 */
export const Phone = meta.story({
  globals: { viewport: { value: 'phone' } },
})

/**
 * Point at a card: its image zooms a little. Change page: the cards slide
 * from the side you go to, the page pill glides and the height follows.
 * Change category: the pill glides and the cards rise in.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: { pageSize: 3 },
})
