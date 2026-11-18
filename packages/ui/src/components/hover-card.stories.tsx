import preview from '#.storybook/preview'

import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card.tsx'
import { PersonAvatar } from './person-avatar.tsx'

const meta = preview.meta({
  title: 'Composants/HoverCard',
  component: HoverCard,
  subcomponents: { HoverCardTrigger, HoverCardContent },
})

/**
 * Point at the name: the client's card shows; the link still leads to
 * their page.
 *
 * @summary A preview behind a name.
 */
export const Basic = meta.story({
  render: () => (
    <p className="text-sm text-fg-muted">
      Demande de{' '}
      <HoverCard>
        <HoverCardTrigger
          href="#client"
          className="font-medium text-fg underline underline-offset-4"
        >
          Marie Durand
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <PersonAvatar name="Marie Durand" color="info" />
            <div className="flex flex-col gap-1">
              <p className="font-medium text-fg">Marie Durand</p>
              <p className="text-fg-muted">Mariage le samedi 12 juin 2027</p>
              <p className="text-fg-muted">120 invités · 18 000 €</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </p>
  ),
})
