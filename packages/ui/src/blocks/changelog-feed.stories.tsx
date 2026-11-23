import preview from '#.storybook/preview'

import { Button } from '../components/button.tsx'
import { ChangelogFeed } from '../components/changelog-feed.tsx'
import type { ChangelogItem } from '../components/changelog-feed.tsx'
import { demoImage } from './demo-images.ts'

const embedSnippet = `<script
  src="https://formulaire.example/embed.js"
  data-lieu="domaine-des-tilleuls"
  async
></script>`

const entries: ChangelogItem[] = [
  {
    id: 'formulaire',
    date: '2026-11-18',
    version: '0.33.0',
    kind: 'new',
    title: 'Le formulaire de demande sur votre propre site',
    summary:
      'Collez quelques lignes de code et les couples vous écrivent sans quitter votre site.',
    details: [
      'Le formulaire reprend les couleurs de votre page publique.',
      'Chaque demande arrive dans « Demandes », avec la date souhaitée et le nombre d’invités.',
    ],
    media: { type: 'code', file: 'index.html', code: embedSnippet },
  },
  {
    id: 'apercu',
    date: '2026-11-18',
    version: '0.33.0',
    kind: 'improved',
    title: 'L’aperçu de la page publique suit vos réglages',
    summary:
      'Voyez votre page sur un ordinateur, une tablette ou un téléphone pendant que vous la modifiez.',
    details: [
      'Les photos et les textes changent dans l’aperçu dès que vous les touchez.',
    ],
  },
  {
    id: 'acomptes',
    date: '2026-11-12',
    version: '0.32.0',
    kind: 'fixed',
    title: 'Les acomptes ne sont plus comptés deux fois',
    summary:
      'Un acompte reçu par virement puis confirmé à la main n’apparaît plus en double dans le total.',
    details: [
      'Les totaux concernés ont été corrigés le 12 novembre.',
      'Les reçus déjà envoyés aux couples restent valables.',
    ],
  },
  {
    id: 'rappels',
    date: '2026-11-04',
    version: '0.31.0',
    kind: 'new',
    title: 'Des rappels avant chaque mariage',
    summary:
      'Vous êtes prévenue 30, 14 et 7 jours avant la date : solde, plan de table, horaires du traiteur.',
    details: [
      'Choisissez les rappels qui vous servent dans les réglages.',
      'Les rappels passés restent visibles dans l’événement.',
    ],
    media: {
      type: 'photo',
      src: demoImage('dawn'),
      alt: 'Illustration : lever de soleil sur des collines roses',
      caption: 'Illustration de démonstration',
      width: 1600,
      height: 1000,
    },
  },
  {
    id: 'import',
    date: '2026-10-28',
    version: '0.29.0',
    kind: 'new',
    title: 'Importez vos anciennes réservations',
    summary:
      'Glissez un fichier CSV et retrouvez toutes vos dates dans le calendrier.',
    details: [
      'Les colonnes sont reconnues même si elles portent d’autres noms.',
      'Rien n’est enregistré avant que vous validiez l’aperçu.',
    ],
  },
  {
    id: 'calendrier',
    date: '2026-10-22',
    version: '0.27.0',
    kind: 'improved',
    title: 'Chaque espace a sa couleur dans le calendrier',
    summary:
      'La grange, l’orangerie et le jardin se distinguent d’un coup d’œil.',
    details: [
      'Survolez une date pour voir l’espace, l’événement et son état.',
      'Les options en attente sont hachurées.',
    ],
    media: {
      type: 'photo',
      src: demoImage('meadow'),
      alt: 'Illustration : prairie verte sous un ciel clair',
      caption: 'Illustration de démonstration',
      width: 1600,
      height: 1000,
    },
  },
  {
    id: 'heure-ete',
    date: '2026-10-14',
    version: '0.25.2',
    kind: 'fixed',
    title: 'Les visites gardent leur heure au passage à l’heure d’hiver',
    summary: 'Une visite prévue à 15 h le 25 octobre ne s’affiche plus à 14 h.',
  },
  {
    id: 'caution',
    date: '2026-09-30',
    version: '0.22.0',
    kind: 'new',
    title: 'La caution par empreinte de carte',
    summary:
      'Bloquez la caution sur la carte du couple sans la débiter, puis libérez-la après l’événement.',
    details: [
      'Le chèque de caution reste possible : notez-le dans l’événement.',
      'L’empreinte est libérée d’elle-même sept jours après la date.',
    ],
  },
  {
    id: 'devis',
    date: '2026-09-16',
    version: '0.21.0',
    kind: 'improved',
    title: 'Un devis envoyé en un clic',
    summary:
      'Le devis part par e-mail avec un lien pour l’accepter, sans pièce jointe à télécharger.',
  },
  {
    id: 'accents',
    date: '2026-09-09',
    version: '0.20.1',
    kind: 'fixed',
    title: 'Les noms accentués restent lisibles dans les exports',
    summary: 'Hélène et Joël s’affichent correctement dans Excel et Numbers.',
    details: ['Réexportez les fichiers créés depuis la version 0.20.0.'],
  },
  {
    id: 'contrats',
    date: '2026-08-26',
    version: '0.19.0',
    kind: 'new',
    title: 'Les contrats se signent en ligne',
    summary:
      'Le couple signe depuis son téléphone et vous recevez le contrat signé dans l’événement.',
    media: {
      type: 'photo',
      src: demoImage('vineyard'),
      alt: 'Illustration : vignes dorées en fin d’été',
      caption: 'Illustration de démonstration',
      width: 1600,
      height: 1000,
    },
  },
  {
    id: 'filtres',
    date: '2026-08-12',
    version: '0.18.2',
    kind: 'fixed',
    title: 'La liste des demandes garde vos filtres',
    summary:
      'En revenant d’une demande, vous retrouvez la liste comme vous l’aviez laissée.',
  },
]

const meta = preview.meta({
  title: 'Blocs/ChangelogFeed',
  component: ChangelogFeed,
  parameters: { layout: 'padded' },
  args: {
    entries,
    subtitle: 'Talyra 0.33 est sortie le 18 novembre 2026.',
    endNote: 'C’est tout depuis Talyra 0.18, en août.',
  },
})

/**
 * The « Nouveautés » page: notes by month, newest first, the newest one
 * open. Tick a kind to filter, open a note for its details, scroll: the
 * month bar follows.
 */
export const Basic = meta.story({})

/**
 * A link or a button beside the title, where Arc UI had an e-mail
 * subscription (GoGoUI has none built in).
 */
export const WithAction = meta.story({
  args: {
    action: <Button variant="outline">Proposer une idée</Button>,
  },
})

/**
 * On a phone: each note's day and version go above its title, the month
 * bar keeps the month alone.
 */
export const Phone = meta.story({
  globals: { viewport: { value: 'phone' } },
})

/**
 * Tick « Corrigé »: its dot grows into a tick, the counts roll, the other
 * notes fade out and the rest close the gap. Open a note: it unfolds and
 * its details rise in. Scroll the list: the month's name rolls and the pill
 * glides to it.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: { defaultOpen: [] },
})
