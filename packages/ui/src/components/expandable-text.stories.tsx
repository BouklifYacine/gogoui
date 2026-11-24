import { useState } from 'react'

import preview from '#.storybook/preview'

import { ExpandableText } from './expandable-text.tsx'

const message =
  'Bonjour, nous nous marions le 12 septembre 2027 et cherchons un domaine pour environ 120 invités, avec un hébergement sur place pour la famille proche. Nous aimerions une cérémonie laïque en extérieur, un vin d’honneur dans le jardin puis un dîner assis. Pourriez-vous nous dire si la date est libre, ce que comprend la location du samedi au dimanche, et si un traiteur est imposé ? Nous pouvons venir visiter un samedi matin.'

const meta = preview.meta({
  title: 'Affichage/ExpandableText',
  tags: ['beta'],
  component: ExpandableText,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

/**
 * A couple's message cut to three lines, « Lire la suite » to open it.
 */
export const Basic = meta.story({
  args: {
    lines: 3,
    size: 'default',
    defaultOpen: false,
    about: 'du message de Léa',
    children: message,
  },
})

/**
 * Short text: no button, nothing is cut.
 */
export const Short = meta.story({
  args: { children: 'Bonjour, la date du 12 septembre est-elle libre ?' },
})

/**
 * Paragraphs and a link: a link hidden under the cut opens the text when
 * Tab reaches it.
 */
export const Paragraphs = meta.story({
  args: {
    lines: 2,
    children: (
      <>
        <p>
          La location comprend le domaine du samedi 10h au dimanche 18h, la
          salle de réception et le parc.
        </p>
        <p>
          Le détail des tarifs est dans <a href="#tarifs">notre brochure</a>.
        </p>
      </>
    ),
  },
})

/**
 * Opened and closed by the page (`open` + `onOpenChange`).
 */
export const Controlled = meta.story({
  render: function Render() {
    const [expanded, setExpanded] = useState(false)
    return (
      <div className="grid gap-3">
        <p className="text-sm text-fg-subtle">
          {expanded ? 'Ouvert' : 'Fermé'}
        </p>
        <ExpandableText open={expanded} onOpenChange={setExpanded}>
          {message}
        </ExpandableText>
      </div>
    )
  },
})

/**
 * What moves: the height, the fade over the last line and the chevron
 * follow one value; the new lines rise through the soft edge; the two
 * labels cross on one spot.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: { lines: 2, children: message },
})
