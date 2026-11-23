import { useState } from 'react'
import {
  CheckIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import { DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu.tsx'
import { SplitButton } from './split-button.tsx'

const meta = preview.meta({
  title: 'Composants/SplitButton',
  component: SplitButton,
  args: {
    children: 'Envoyer le devis',
    iconStart: <PaperPlaneTiltIcon />,
    menu: (
      <>
        <DropdownMenuItem>
          <ClockIcon />
          Programmer l’envoi
        </DropdownMenuItem>
        <DropdownMenuItem>
          <EnvelopeSimpleIcon />
          M’envoyer un test
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <TrashIcon />
          Supprimer le brouillon
        </DropdownMenuItem>
      </>
    ),
  },
})

/**
 * Send the quote now, or open the chevron for its variants.
 */
export const Basic = meta.story({})

/**
 * The white button, for an action beside the main one.
 */
export const Outline = meta.story({ args: { variant: 'outline' } })

/**
 * The three sizes.
 */
export const Sizes = meta.story({
  render: (args) => (
    <div className="flex items-center gap-3">
      <SplitButton {...args} size="sm" />
      <SplitButton {...args} />
      <SplitButton {...args} size="lg" />
    </div>
  ),
})

/**
 * Blocked while the quote is incomplete.
 */
export const Disabled = meta.story({ args: { disabled: true } })

/**
 * Press the main half: the whole pill squeezes (the chevron alone does
 * not); « Envoyer le devis » morphs into « Devis envoyé » letter by letter,
 * the icon trades places and the width follows. The chevron turns over
 * while its menu is open.
 */
export const Animations = meta.story({
  tags: ['animated'],
  render: function Render(args) {
    const [sent, setSent] = useState(false)
    return (
      <SplitButton
        {...args}
        iconStart={sent ? <CheckIcon /> : <PaperPlaneTiltIcon />}
        onClick={() => setSent((done) => !done)}
      >
        {sent ? 'Devis envoyé' : 'Envoyer le devis'}
      </SplitButton>
    )
  },
})
