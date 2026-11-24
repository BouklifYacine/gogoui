import {
  CalendarCheckIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  HandshakeIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Timeline } from './timeline.tsx'

const meta = preview.meta({
  title: 'Affichage/Timeline',
  component: Timeline,
  decorators: [(Story) => <div className="w-[28rem]">{Story()}</div>],
})

/**
 * A request's history, newest first.
 */
export const Basic = meta.story({
  args: {
    events: [
      {
        id: '4',
        title: 'Acompte reçu',
        time: 'il y a 2 h',
        description: '1 500 € par virement',
        icon: <HandshakeIcon />,
        color: 'success',
      },
      {
        id: '3',
        title: 'Devis envoyé',
        time: 'hier',
        description: 'Devis n° 42, 18 000 €',
        icon: <FileTextIcon />,
        color: 'info',
      },
      {
        id: '2',
        title: 'Visite faite',
        time: '3 juin',
        icon: <CalendarCheckIcon />,
      },
      {
        id: '1',
        title: 'Demande reçue',
        time: '28 mai',
        description: 'Par le formulaire du site',
        icon: <EnvelopeSimpleIcon />,
      },
    ],
  },
})
