import { useState } from 'react'
import {
  ArchiveIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  LinkIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { Button } from './button.tsx'
import { ButtonGroup } from './button-group.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.tsx'

const meta = preview.meta({
  title: 'Actions/ButtonGroup',
  component: ButtonGroup,
})

/**
 * Moving through a calendar: back, today, forward, glued as one control.
 */
export const Basic = meta.story({
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Mois précédent">
        <CaretLeftIcon />
      </Button>
      <Button variant="outline">Aujourd'hui</Button>
      <Button variant="outline" size="icon" aria-label="Mois suivant">
        <CaretRightIcon />
      </Button>
    </ButtonGroup>
  ),
})

/**
 * One surface for a document's actions: hairline separators, one
 * highlight under the button pointed at, and « … » opening the rest.
 */
export const Surface = meta.story({
  args: { variant: 'surface', 'aria-label': 'Actions du devis' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="ghost" iconStart={<PencilSimpleIcon />}>
        Modifier
      </Button>
      <Button variant="ghost" iconStart={<ShareNetworkIcon />}>
        Partager
      </Button>
      <Button variant="ghost" iconStart={<ArchiveIcon />}>
        Archiver
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Plus d’actions" />
          }
        >
          <CaretDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>Dupliquer</DropdownMenuItem>
          <DropdownMenuItem>Télécharger en PDF</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <TrashIcon />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
})

/**
 * Filled in a colour, for the main group of a view; the highlight and the
 * separators come from its words' colour.
 */
export const SurfaceFilled = meta.story({
  args: { variant: 'surface', color: 'primary', 'aria-label': 'Envoi' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="ghost">Envoyer</Button>
      <Button variant="ghost">Programmer</Button>
    </ButtonGroup>
  ),
})

/**
 * Stacked: the separators turn horizontal, the highlight moves up and
 * down.
 */
export const SurfaceVertical = meta.story({
  args: {
    variant: 'surface',
    orientation: 'vertical',
    'aria-label': 'Affichage',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="ghost">Jour</Button>
      <Button variant="ghost">Semaine</Button>
      <Button variant="ghost" disabled>
        Mois
      </Button>
    </ButtonGroup>
  ),
})

/**
 * Too narrow for its words: the buttons keep their icon only, and get
 * their words back when the room returns.
 */
export const SurfaceCollapsed = meta.story({
  args: { variant: 'surface', 'aria-label': 'Actions du devis' },
  render: (args) => (
    <div className="w-56 resize-x overflow-hidden rounded-md border border-dashed p-2">
      <ButtonGroup {...args}>
        <Button variant="ghost" iconStart={<PencilSimpleIcon />}>
          Modifier
        </Button>
        <Button variant="ghost" iconStart={<ShareNetworkIcon />}>
          Partager
        </Button>
        <Button variant="ghost" iconStart={<ArchiveIcon />}>
          Archiver
        </Button>
      </ButtonGroup>
    </div>
  ),
})

/**
 * The highlight glides from button to button under the pointer (it jumps
 * with the arrows), darkens on a press, and the separators beside it step
 * aside; « Copier le lien » turns into « Lien copié », read once.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render() {
    const [copied, setCopied] = useState(false)
    return (
      <ButtonGroup variant="surface" aria-label="Partage">
        <Button
          variant="ghost"
          iconStart={copied ? <CheckIcon /> : <LinkIcon />}
          onClick={() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
        >
          {copied ? 'Lien copié' : 'Copier le lien'}
        </Button>
        <Button variant="ghost" iconStart={<ShareNetworkIcon />}>
          Partager
        </Button>
        <Button variant="ghost" iconStart={<ArchiveIcon />}>
          Archiver
        </Button>
      </ButtonGroup>
    )
  },
})
