import {
  ArchiveIcon,
  ArrowBendUpLeftIcon,
  ShareNetworkIcon,
  StarIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import {
  ExpandingButtonGroup,
  ExpandingButtonGroupItem,
} from './expanding-button-group.tsx'

const meta = preview.meta({
  title: 'Actions/ExpandingButtonGroup',
  tags: ['beta', 'deprecated'],
  component: ExpandingButtonGroup,
  args: {
    'aria-label': 'Actions de la demande',
    children: (
      <>
        <ExpandingButtonGroupItem value="reply" icon={<ArrowBendUpLeftIcon />}>
          Répondre
        </ExpandingButtonGroupItem>
        <ExpandingButtonGroupItem
          value="star"
          icon={<StarIcon />}
          doneLabel="Suivie"
        >
          Suivre
        </ExpandingButtonGroupItem>
        <ExpandingButtonGroupItem
          value="archive"
          icon={<ArchiveIcon />}
          doneLabel="Archivée"
        >
          Archiver
        </ExpandingButtonGroupItem>
        <ExpandingButtonGroupItem
          value="share"
          icon={<ShareNetworkIcon />}
          disabled
        >
          Partager
        </ExpandingButtonGroupItem>
        <ExpandingButtonGroupItem
          value="delete"
          icon={<TrashIcon />}
          color="danger"
        >
          Supprimer
        </ExpandingButtonGroupItem>
      </>
    ),
  },
})

/**
 * A request's actions: « Répondre » shows its label at rest; point at
 * another and it takes the label.
 */
export const Basic = meta.story({})

/**
 * Smaller, for a dense row.
 */
export const Small = meta.story({ args: { size: 'sm' } })

/**
 * « Archiver » open at rest, the main action of this place.
 */
export const DefaultValue = meta.story({ args: { defaultValue: 'archive' } })

/**
 * Point along the bar: the width opens on a spring, the neighbours slide,
 * the label slips out from behind its icon. « Archiver » waits a second
 * (its icon pulses), then draws a tick and says « Archivée » on green.
 */
export const Animations = meta.story({
  tags: ['animated'],
  args: {
    children: (
      <>
        <ExpandingButtonGroupItem value="reply" icon={<ArrowBendUpLeftIcon />}>
          Répondre
        </ExpandingButtonGroupItem>
        <ExpandingButtonGroupItem
          value="archive"
          icon={<ArchiveIcon />}
          doneLabel="Archivée"
          onClick={() => new Promise((resolve) => setTimeout(resolve, 1000))}
        >
          Archiver
        </ExpandingButtonGroupItem>
        <ExpandingButtonGroupItem
          value="delete"
          icon={<TrashIcon />}
          color="danger"
        >
          Supprimer
        </ExpandingButtonGroupItem>
      </>
    ),
  },
})
